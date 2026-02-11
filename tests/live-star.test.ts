import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { resolveRepo } from '../src/setup.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Live GitHub Star Test (No Mocks)', () => {
    it('should successfully star the repository using gh CLI', () => {
        // 1. Resolve the actual repo from the environment/package.json
        const repo = resolveRepo(dirname(__dirname));
        console.log(`Resolved repo for live test: ${repo}`);

        expect(repo).toBe('saurabhsharma2u/search-console-mcp');

        // 2. Execute the actual PUT call
        // We use --include to see headers in output if needed, but exit code 0 is the key
        const starCommand = `gh api -X PUT /user/starred/${repo}`;

        expect(() => {
            execSync(starCommand, { stdio: 'pipe' });
        }).not.toThrow();

        // 3. Verify it's starred by checking the status
        // HTTP 204 means starred, HTTP 404 means not starred
        const checkCommand = `gh api -X GET /user/starred/${repo} --include`;
        const output = execSync(checkCommand, { encoding: 'utf8' });

        expect(output).toContain('HTTP/2.0 204');
    });
});
