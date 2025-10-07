# File Permissions Guide

This guide explains the file permission system for the ChurchFlow application and how to maintain proper security.

## 🔒 Permission Overview

### Standard Permissions
- **Directories**: `755` (rwxr-xr-x) - Owner can read/write/execute, others can read/execute
- **Files**: `644` (rw-r--r--) - Owner can read/write, others can read only
- **Environment Files**: `600` (rw-------) - Owner can read/write only
- **Scripts**: `755` (rwxr-xr-x) - Owner can read/write/execute, others can read/execute

## 📁 Directory Structure Permissions

```
ChurchFlow/
├── app/                    # 755 - Next.js app directory
├── lib/                    # 755 - Library files
├── prisma/                 # 755 - Database schema and migrations
├── components/             # 755 - React components
├── tests/                  # 755 - Test files
├── .env.local              # 600 - Environment variables (SECURE)
├── package.json            # 644 - Package configuration
├── next.config.js          # 644 - Next.js configuration
└── fix-permissions.sh      # 755 - Permission management script
```

## 🔧 Permission Management Commands

### Check Current Permissions
```bash
npm run permissions:check
# or
./fix-permissions.sh check
```

### Fix All Permissions
```bash
npm run permissions:fix
# or
./fix-permissions.sh set
```

### Manual Permission Commands
```bash
# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Secure environment files
chmod 600 .env*

# Make scripts executable
chmod 755 *.sh
```

## 🔒 Security Considerations

### Environment Files (600)
Environment files contain sensitive information and should only be readable by the owner:
- `.env.local` - Development environment variables
- `.env.production` - Production environment variables
- `.env.local.backup` - Backup environment files

### Configuration Files (644)
Configuration files should be readable but not writable by others:
- `package.json` - Package dependencies
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Application Files (644)
All application files should have standard permissions:
- JavaScript files (`.js`)
- TypeScript files (`.ts`, `.tsx`)
- CSS files (`.css`)
- Markdown files (`.md`)

### Scripts (755)
Executable scripts need execute permissions:
- Shell scripts (`.sh`)
- Node.js scripts
- Build scripts

## 🚨 Security Checks

### World-Writable Files
Files that are writable by everyone (`-w-`) are a security risk:
```bash
find . -type f -perm -002
```

### Group-Writable Files
Files that are writable by the group (`-w-`) should be reviewed:
```bash
find . -type f -perm -020
```

### Overly Permissive Directories
Directories with write permissions for others:
```bash
find . -type d -perm -002
```

## 🔧 Permission Troubleshooting

### Common Issues

#### Files Not Readable
```bash
# Error: Permission denied
# Solution: Check file permissions
ls -la filename
chmod 644 filename
```

#### Directories Not Accessible
```bash
# Error: Permission denied
# Solution: Check directory permissions
ls -ld directory
chmod 755 directory
```

#### Environment Variables Not Loading
```bash
# Error: Cannot read .env file
# Solution: Check environment file permissions
ls -la .env*
chmod 600 .env*
```

#### Scripts Not Executable
```bash
# Error: Permission denied
# Solution: Make script executable
chmod 755 script.sh
```

### Permission Recovery

If permissions get corrupted, use the permission fix script:
```bash
./fix-permissions.sh set
```

This will:
1. Set all directories to 755
2. Set all files to 644
3. Secure environment files to 600
4. Make scripts executable (755)
5. Verify security settings

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] Environment files have 600 permissions
- [ ] No world-writable files
- [ ] No group-writable files
- [ ] Scripts are executable
- [ ] Configuration files are readable

### Production Commands
```bash
# Check permissions before deployment
npm run permissions:check

# Fix permissions if needed
npm run permissions:fix

# Verify security
find . -type f -perm -002 -o -perm -020
```

## 📊 Permission Monitoring

### Regular Checks
Run permission checks regularly:
```bash
# Weekly permission check
npm run permissions:check

# Monthly security audit
find . -type f -perm -002 -o -perm -020
```

### Automated Monitoring
Add permission checks to CI/CD pipeline:
```yaml
# GitHub Actions example
- name: Check File Permissions
  run: |
    npm run permissions:check
    if [ $? -ne 0 ]; then
      echo "Permission issues detected"
      exit 1
    fi
```

## 🔍 Permission Examples

### Correct Permissions
```bash
# Environment file (secure)
-rw------- 1 user staff 906 .env.local

# Directory (accessible)
drwxr-xr-x 11 user staff 352 app/

# JavaScript file (readable)
-rw-r--r-- 1 user staff 7825 lib/database-config.js

# Shell script (executable)
-rwxr-xr-x 1 user staff 4347 fix-permissions.sh
```

### Incorrect Permissions
```bash
# Environment file (too permissive)
-rw-rw-rw- 1 user staff 906 .env.local  # ❌ World-writable

# Directory (too restrictive)
dr--r--r-- 11 user staff 352 app/       # ❌ Not executable

# Script (not executable)
-rw-r--r-- 1 user staff 4347 script.sh # ❌ Cannot execute
```

## 📞 Support

If you encounter permission issues:

1. **Check current permissions**: `npm run permissions:check`
2. **Fix permissions**: `npm run permissions:fix`
3. **Verify security**: Look for world-writable files
4. **Review logs**: Check application logs for permission errors
5. **Contact support**: If issues persist

---

**Remember**: Proper file permissions are essential for security and functionality. Always verify permissions after making changes to the file system.

