#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { createInterface } from 'readline';
import { homedir } from 'os';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

function printHeader() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          🔧 Search Console MCP - Setup Wizard               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

function printStep(num: number, text: string) {
    console.log(`\n📌 Step ${num}: ${text}\n`);
}

function printSuccess(text: string) {
    console.log(`✅ ${text}`);
}

function printError(text: string) {
    console.log(`❌ ${text}`);
}

function printInfo(text: string) {
    console.log(`ℹ️  ${text}`);
}

interface ServiceAccountKey {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
}

function validateKeyFile(path: string): ServiceAccountKey | null {
    try {
        const fullPath = resolve(path.replace('~', homedir()));

        if (!existsSync(fullPath)) {
            printError(`File not found: ${fullPath}`);
            return null;
        }

        const content = readFileSync(fullPath, 'utf-8');
        const key = JSON.parse(content) as ServiceAccountKey;

        // Validate required fields
        const required = ['type', 'project_id', 'client_email', 'private_key'];
        const missing = required.filter(f => !(f in key));

        if (missing.length > 0) {
            printError(`Missing required fields: ${missing.join(', ')}`);
            return null;
        }

        if (key.type !== 'service_account') {
            printError(`Invalid key type: ${key.type}. Expected 'service_account'`);
            return null;
        }

        return key;
    } catch (error) {
        printError(`Failed to parse JSON: ${(error as Error).message}`);
        return null;
    }
}

async function testConnection(keyPath: string): Promise<boolean> {
    try {
        // Set the environment variable temporarily
        process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(keyPath.replace('~', homedir()));

        // Try to authenticate
        const { google } = await import('googleapis');
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        await auth.getClient();
        return true;
    } catch (error) {
        printError(`Authentication failed: ${(error as Error).message}`);
        return false;
    }
}

async function main() {
    printHeader();

    console.log('This wizard will help you set up Search Console MCP.');
    console.log('You will need a Google Cloud service account with Search Console access.\n');

    // Step 1: Check for existing credentials
    printStep(1, 'Locate your service account JSON key file');

    console.log('If you don\'t have one yet, follow these steps:');
    console.log('  1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts');
    console.log('  2. Create a new service account (or select existing)');
    console.log('  3. Click "Keys" > "Add Key" > "Create new key" > "JSON"');
    console.log('  4. Save the downloaded JSON file\n');

    const keyPath = await ask('Enter the path to your JSON key file: ');

    if (!keyPath) {
        printError('No path provided. Exiting.');
        rl.close();
        process.exit(1);
    }

    // Validate the key file
    const key = validateKeyFile(keyPath);
    if (!key) {
        rl.close();
        process.exit(1);
    }

    printSuccess('JSON key file is valid!');
    printInfo(`Project: ${key.project_id}`);
    printInfo(`Service Account: ${key.client_email}`);

    // Step 2: Show service account email
    printStep(2, 'Add service account to Google Search Console');

    console.log('You need to add this email as a user in Google Search Console:\n');
    console.log(`  📧 ${key.client_email}\n`);
    console.log('Steps:');
    console.log('  1. Go to https://search.google.com/search-console');
    console.log('  2. Select your property (or add one if needed)');
    console.log('  3. Click "Settings" (gear icon) in the sidebar');
    console.log('  4. Click "Users and permissions"');
    console.log('  5. Click "Add user"');
    console.log(`  6. Enter: ${key.client_email}`);
    console.log('  7. Set permission to "Full" (or "Restricted" for read-only)');
    console.log('  8. Click "Add"\n');

    await ask('Press Enter when you\'ve added the service account to Search Console...');

    // Step 3: Test connection
    printStep(3, 'Test connection');

    console.log('Testing authentication with Google APIs...');
    const connected = await testConnection(keyPath);

    if (connected) {
        printSuccess('Authentication successful!');
    } else {
        printError('Authentication failed. Please check your credentials and try again.');
        rl.close();
        process.exit(1);
    }

    // Step 4: Show configuration
    printStep(4, 'Configure your MCP client');

    const fullPath = resolve(keyPath.replace('~', homedir()));

    console.log('Add this to your MCP client configuration:\n');
    console.log('For Claude Desktop (~/.config/claude/claude_desktop_config.json):');
    console.log('─'.repeat(60));
    console.log(JSON.stringify({
        mcpServers: {
            "search-console": {
                command: "npx",
                args: ["search-console-mcp"],
                env: {
                    GOOGLE_APPLICATION_CREDENTIALS: fullPath
                }
            }
        }
    }, null, 2));
    console.log('─'.repeat(60));

    console.log('\nFor VS Code Copilot (.vscode/mcp.json):');
    console.log('─'.repeat(60));
    console.log(JSON.stringify({
        servers: {
            "search-console": {
                command: "npx",
                args: ["search-console-mcp"],
                env: {
                    GOOGLE_APPLICATION_CREDENTIALS: fullPath
                }
            }
        }
    }, null, 2));
    console.log('─'.repeat(60));

    console.log('\n🎉 Setup complete! You can now use Search Console MCP.\n');

    rl.close();
}

// Run if called directly
main().catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
});
