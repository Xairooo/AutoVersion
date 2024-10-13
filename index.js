const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');

const STATUSFILE = '.zzz-git-status';
const VERSIONFILE = 'version.json';

function updateGitStatus() {
  try {
    const gitStatus = execSync('git status -s', { encoding: 'utf8' });
    const filenames = gitStatus.split('\n')
      .map(line => {
        if (line.length < 4) return null;
        let filename = line.slice(3);
        if (filename.startsWith('"') && filename.endsWith('"')) {
          filename = filename.slice(1, -1);
        }
        return filename;
      })
      .filter(Boolean);

    if (filenames.length > 0) {
      fs.writeFileSync(STATUSFILE, filenames.join('\n'));
    } else if (fs.existsSync(STATUSFILE)) {
      fs.unlinkSync(STATUSFILE);
    }
    console.log('Git status updated.');
  } catch (error) {
    console.error('Error updating Git status:', error);
    process.exit(1);
  }
}

function getCurrentVersion() {
  if (fs.existsSync(VERSIONFILE)) {
    const versionData = JSON.parse(fs.readFileSync(VERSIONFILE, 'utf8'));
    return versionData.version;
  }
  return '0.1.0';
}

function incrementVersion(currentVersion, incrementType) {
  switch (incrementType) {
    case 'major':
      return semver.inc(currentVersion, 'major');
    case 'minor':
      return semver.inc(currentVersion, 'minor');
    case 'patch':
    default:
      return semver.inc(currentVersion, 'patch');
  }
}

function updateTemplateFile(templateFile, version, date) {
  try {
    let content = fs.readFileSync(templateFile, 'utf8');
    content = content.replace(/\{version\}/g, version);
    content = content.replace(/\{date\}/g, date);
    fs.writeFileSync(templateFile, content);
    console.log(`Updated template file: ${templateFile}`);
  } catch (error) {
    console.error(`Error updating template file ${templateFile}:`, error);
  }
}

function commitVersionUpdate(incrementType = 'patch', templateFile = null) {
  try {
    if (!fs.existsSync(STATUSFILE)) {
      console.log('No status file found. Run updateGitStatus first.');
      return;
    }

    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, incrementType);
    const buildDate = new Date().toDateString();
    const filenames = fs.readFileSync(STATUSFILE, 'utf8').split('\n').filter(Boolean);

    // Update version.json
    const versionData = {
      version: newVersion,
      buildDate: buildDate
    };
    fs.writeFileSync(VERSIONFILE, JSON.stringify(versionData, null, 2));
    console.log(`Updated ${VERSIONFILE}`);

    // Update template file if specified
    if (templateFile) {
      updateTemplateFile(templateFile, newVersion, buildDate);
    }

    filenames.forEach(filename => {
      try {
        const fullPath = path.resolve(filename);
        if (fs.statSync(fullPath).isDirectory()) {
          console.log(`Skipping directory: ${filename}`);
          return;
        }
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/\$Rev[^\$]*\$/g, `$Rev: ${newVersion}$`);
        content = content.replace(/\$Date[^\$]*\$/g, `$Date: ${buildDate}$`);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${filename}`);
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
      }
    });

    fs.unlinkSync(STATUSFILE);

    // Add version.json and template file (if specified) to git
    execSync('git add version.json');
    if (templateFile) {
      execSync(`git add "${templateFile}"`);
    }

    execSync(`git commit -a -m "Version ${newVersion}" -n`, { stdio: 'inherit' });
    console.log(`Updated version to ${newVersion} and committed changes.`);
  } catch (error) {
    console.error('Error committing version update:', error);
    process.exit(1);
  }
}

function updateAndCommit(incrementType = 'patch', templateFile = null) {
  updateGitStatus();
  commitVersionUpdate(incrementType, templateFile);
}

module.exports = {
  updateGitStatus,
  commitVersionUpdate,
  updateAndCommit
};