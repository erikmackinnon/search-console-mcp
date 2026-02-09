#!/usr/bin/env node
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { createInterface } from 'readline';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        const sanitizedPath = path.trim().replace(/\0/g, '');
        const fullPath = resolve(sanitizedPath.replace('~', homedir()));

        if (!existsSync(fullPath)) {
            printError(`File not found: ${fullPath}`);
            return null;
        }

        const stats = statSync(fullPath);
        if (!stats.isFile()) {
            printError(`Not a regular file: ${fullPath}`);
            return null;
        }

        if (extname(fullPath).toLowerCase() !== '.json') {
            printError(`Invalid file type. Please provide a .json file.`);
            return null;
        }

        if (stats.size > 1024 * 1024) {
            printError(`File too large. Service account keys are typically small JSON files.`);
            return null;
        }

        const content = readFileSync(fullPath, 'utf-8');
        const key = JSON.parse(content) as ServiceAccountKey;

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
        process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(keyPath.replace('~', homedir()));
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

function showConfigSnippets(credentialsPath: string) {
    console.log('\nAdd this to your MCP client configuration:\n');
    console.log('For Claude Desktop (~/.config/claude/claude_desktop_config.json):');
    console.log('─'.repeat(60));
    console.log(JSON.stringify({
        mcpServers: {
            "search-console": {
                command: "npx",
                args: ["search-console-mcp"],
                env: {
                    GOOGLE_APPLICATION_CREDENTIALS: credentialsPath
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
                    GOOGLE_APPLICATION_CREDENTIALS: credentialsPath
                }
            }
        }
    }, null, 2));
    console.log('─'.repeat(60));
}

export function resolveRepo(dirname: string): string {
    let repo = '';
    try {
        const url = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        repo = url
            .replace(/^git@github\.com:|^https:\/\/github\.com\//, '')
            .replace(/\.git$/, '');
    } catch {
        // Fallback to package.json
        const pkgPath = resolve(dirname, '../package.json');
        if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
            if (pkg.repository?.url) {
                repo = pkg.repository.url.replace(/.*github\.com\//, '').replace(/\.git$/, '');
            } else if (pkg.mcpName && pkg.mcpName.includes('/')) {
                // Handle io.github.owner/repo or owner/repo
                repo = pkg.mcpName.replace(/^io\.github\./, '').split('/').slice(-2).join('/');
            }
        }
    }
    return repo;
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

    const keyPath = await ask('Enter the path to your JSON key file (or press Enter to see config examples): ');

    // Default values for when no path provided
    let serviceAccountEmail = '<your-service-account>@<project>.iam.gserviceaccount.com';
    let credentialsPath = '/path/to/your/service-account-key.json';

    if (keyPath) {
        // Validate the key file
        const key = validateKeyFile(keyPath);
        if (!key) {
            rl.close();
            process.exit(1);
        }

        printSuccess('JSON key file is valid!');
        printInfo(`Project: ${key.project_id}`);
        printInfo(`Service Account: ${key.client_email}`);
        serviceAccountEmail = key.client_email;
        credentialsPath = resolve(keyPath.replace('~', homedir()));

        // Step 2: Show service account email
        printStep(2, 'Add service account to Google Search Console');

        console.log('You need to add this email as a user in Google Search Console:\n');
        console.log(`  📧 ${serviceAccountEmail}\n`);
        console.log('Steps:');
        console.log('  1. Go to https://search.google.com/search-console');
        console.log('  2. Select your property (or add one if needed)');
        console.log('  3. Click "Settings" (gear icon) in the sidebar');
        console.log('  4. Click "Users and permissions"');
        console.log('  5. Click "Add user"');
        console.log(`  6. Enter: ${serviceAccountEmail}`);
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
        showConfigSnippets(credentialsPath);
        console.log('\n🎉 Setup complete! You can now use Search Console MCP.\n');

    } else {
        // No path provided - just show config examples
        printInfo('No credentials file provided. Showing example configuration...\n');

        printStep(2, 'Add service account to Google Search Console');
        console.log('After creating your service account, add this email to Search Console:');
        console.log(`  📧 ${serviceAccountEmail}\n`);

        printStep(3, 'Configure your MCP client');
        showConfigSnippets(credentialsPath);
        console.log('\n💡 Run this wizard again with your JSON file path for validation.\n');
    }

    // Step 5: Support the project
    printStep(5, 'Support this project');
    const answer = await ask('Would you like to star the repo on GitHub? (y/n): ');
    if (answer.toLowerCase().startsWith('y')) {
        try {
            const repo = resolveRepo(__dirname);

            if (repo && repo.includes('/')) {
                execSync(`gh api -X PUT /user/starred/${repo}`, { stdio: 'ignore' });
                printSuccess('Thanks for your support! ⭐');
            } else {
                throw new Error('Could not resolve repo');
            }
        } catch (error) {
            console.log('\nCould not star automatically. Please star us manually if you like:');
            console.log('🔗 https://github.com/saurabhsharma2u/search-console-mcp');
        }
    } else {
        console.log('No problem! Enjoy using Search Console MCP.');
    }

    rl.close();
}

// Run if called directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
    main().catch((error) => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}
