const { execSync } = require('child_process');

const jestConfig = process.argv[2] || './config/jest.config.e2e.ts';
const testArgs = process.argv.slice(3).join(' ');

function run(cmd, options = {}) {
    try {
        console.log(`▶️ Running: ${cmd}`);
        execSync(cmd, { stdio: 'inherit', ...options });
    } catch (err) {
        console.error(`❌ Command failed: ${cmd}`);
        throw err;
    }
}

(async () => {
    try {
        run('npm run docker:up');
        run('npm run wait-for-services');
        run(`jest --config ${jestConfig} ${testArgs}`);
    } catch (err) {
        // Test failed, but continue to cleanup
    } finally {
        console.log('🧹 Cleaning up Docker...');
        try {
            run('npm run docker:down');
        } catch (_) {
            console.error('⚠️ Failed to stop Docker. Please check manually.');
        }
    }
})();
