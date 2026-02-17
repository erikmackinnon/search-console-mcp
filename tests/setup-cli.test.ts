
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runLogout } from '../src/setup.js';
import * as googleClient from '../src/google/client.js';

// Mock the google-client module
vi.mock('../src/google/client.js', () => ({
    logout: vi.fn(),
    startLocalFlow: vi.fn(),
    saveTokens: vi.fn(),
    getUserEmail: vi.fn(),
    DEFAULT_CLIENT_ID: 'mock-id',
    DEFAULT_CLIENT_SECRET: 'mock-secret'
}));

// Mock console.log/error to keep test output clean
const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => { }),
    error: vi.spyOn(console, 'error').mockImplementation(() => { })
};

// Mock readline since runLogout closes it
vi.mock('readline', () => ({
    createInterface: () => ({
        close: vi.fn(),
        question: vi.fn((q, cb) => cb('n')),
    })
}));

describe('CLI Commands', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset process.argv
        process.argv = ['node', 'script'];
    });

    describe('runLogout', () => {
        it('should logout of default account when no email is provided', async () => {
            await runLogout();

            expect(googleClient.logout).toHaveBeenCalledWith(undefined);
            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Successfully logged out from default account'));
        });

        it('should logout of specific account when email is provided via CLI args', async () => {
            // Simulate CLI args: npx search-console-mcp logout user@example.com
            process.argv = ['node', 'script', 'logout', 'user@example.com'];

            await runLogout();

            expect(googleClient.logout).toHaveBeenCalledWith('user@example.com');
            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Successfully logged out and removed credentials for user@example.com'));
        });

        it('should handle logout errors gracefully', async () => {
            vi.mocked(googleClient.logout).mockRejectedValue(new Error('Keychain error'));

            await runLogout();

            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Logout failed: Keychain error'));
        });
    });

    describe('login', () => {
        // Mock process.exit
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`Process.exit(${code})`);
        });

        it('should execute full login flow successfully', async () => {
            // Mock successfully 
            vi.mocked(googleClient.startLocalFlow).mockResolvedValue({ access_token: 'fake-token' });
            vi.mocked(googleClient.getUserEmail).mockResolvedValue('test@example.com');
            vi.mocked(googleClient.saveTokens).mockResolvedValue(undefined);

            // Import login dynamically or use top-level if exported
            const { login } = await import('../src/setup.js');

            try {
                await login();
            } catch (e) {
                // Ignore rl.close error if any, or process.exit
            }

            expect(googleClient.startLocalFlow).toHaveBeenCalled();
            expect(googleClient.getUserEmail).toHaveBeenCalledWith({ access_token: 'fake-token' });
            expect(googleClient.saveTokens).toHaveBeenCalledWith({ access_token: 'fake-token' }, 'test@example.com');
            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Successfully authenticated as test@example.com!'));
        });

        it('should handle login failure', async () => {
            vi.mocked(googleClient.startLocalFlow).mockRejectedValue(new Error('Auth rejected'));

            const { login } = await import('../src/setup.js');

            await expect(login()).rejects.toThrow('Process.exit(1)');

            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Authentication failed: Auth rejected'));
        });
    });
});
