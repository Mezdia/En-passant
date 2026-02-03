#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';
import path from 'path';
import fs from 'fs';

const PLATFORMS = {
  WINDOWS: 'windows',
  LINUX: 'linux',
  MACOS: 'macos'
};

const TARGETS = {
  [PLATFORMS.WINDOWS]: 'x86_64-pc-windows-msvc',
  [PLATFORMS.LINUX]: 'x86_64-unknown-linux-gnu',
  [PLATFORMS.MACOS]: {
    INTEL: 'x86_64-apple-darwin',
    ARM: 'aarch64-apple-darwin'
  }
};

function runCommand(command, description) {
  console.log(`🚀 ${description}`);
  console.log(`📋 Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function buildFrontend() {
  return runCommand('npm run build-vite', 'Building frontend assets');
}

function buildWindowsInstaller() {
  console.log('🏗️ Building Windows installer...');
  const success = runCommand('npm run build:windows', 'Building Windows installer');
  return success;
}

function buildLinuxInstaller() {
  console.log('🏗️ Building Linux installer...');
  const success = runCommand('npm run build:linux', 'Building Linux installer');
  return success;
}

function buildMacOSInstaller() {
  console.log('🏗️ Building macOS installer...');
  // Build for both Intel and ARM architectures
  const intelSuccess = runCommand('npm run build:mac-intel', 'Building macOS Intel installer');
  const armSuccess = runCommand('npm run build:mac-arm', 'Building macOS ARM installer');
  return intelSuccess && armSuccess;
}

function buildAllInstallers() {
  console.log('🌍 Starting build process for all platforms...');

  // Build frontend first
  if (!buildFrontend()) {
    console.error('❌ Frontend build failed, stopping process');
    return false;
  }

  // Build for current platform
  const currentPlatform = platform();
  let success = false;

  if (currentPlatform === 'win32') {
    success = buildWindowsInstaller();
  } else if (currentPlatform === 'linux') {
    success = buildLinuxInstaller();
  } else if (currentPlatform === 'darwin') {
    success = buildMacOSInstaller();
  } else {
    console.log(`⚠️ Current platform (${currentPlatform}) not recognized for building`);
    console.log('📝 You can manually build for specific platforms using:');
    console.log('   - npm run build:windows');
    console.log('   - npm run build:linux');
    console.log('   - npm run build:mac-intel');
    console.log('   - npm run build:mac-arm');
    return false;
  }

  if (success) {
    console.log('🎉 Build process completed successfully!');
    console.log('📁 Installers can be found in the src-tauri/target/release/bundle directory');
  } else {
    console.error('❌ Build process failed');
  }

  return success;
}

function showHelp() {
  console.log('📚 En-passant Installer Builder');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/build-installers.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --all, -a        Build installers for all platforms (current platform only)');
  console.log('  --windows, -w    Build Windows installer');
  console.log('  --linux, -l      Build Linux installer');
  console.log('  --macos, -m      Build macOS installer');
  console.log('  --help, -h       Show this help message');
  console.log('');
  console.log('Note: Cross-platform building requires proper toolchains to be installed');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Build frontend first for any build operation
  if (!buildFrontend()) {
    process.exit(1);
  }

  let success = true;

  if (args.includes('--all') || args.includes('-a')) {
    success = buildAllInstallers();
  } else {
    if (args.includes('--windows') || args.includes('-w')) {
      success = buildWindowsInstaller() && success;
    }
    if (args.includes('--linux') || args.includes('-l')) {
      success = buildLinuxInstaller() && success;
    }
    if (args.includes('--macos') || args.includes('-m')) {
      success = buildMacOSInstaller() && success;
    }
  }

  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
