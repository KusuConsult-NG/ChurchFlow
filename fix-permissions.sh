#!/bin/bash

# File Permission Management Script for ChurchFlow
# This script ensures proper file permissions for security and functionality

echo "🔧 CHURCHFLOW PERMISSION MANAGEMENT"
echo "=================================="
echo ""

# Function to set permissions
set_permissions() {
    echo "📁 Setting directory permissions..."
    find . -path "./node_modules" -prune -o -path "./.git" -prune -o -type d -print | xargs chmod 755 2>/dev/null
    echo "✅ Directories set to 755 (rwxr-xr-x)"
    
    echo ""
    echo "📄 Setting file permissions..."
    find . -path "./node_modules" -prune -o -path "./.git" -prune -o -type f -print | xargs chmod 644 2>/dev/null
    echo "✅ Files set to 644 (rw-r--r--)"
    
    echo ""
    echo "🔒 Securing sensitive files..."
    # Environment files
    chmod 600 .env* 2>/dev/null
    echo "✅ Environment files secured (600)"
    
    # Configuration files that might contain sensitive data
    chmod 600 *.config.js 2>/dev/null
    chmod 600 ecosystem.config.js 2>/dev/null
    echo "✅ Configuration files secured"
    
    echo ""
    echo "📋 Setting executable permissions for scripts..."
    # Make shell scripts executable
    find . -path "./node_modules" -prune -o -name "*.sh" -print | xargs chmod 755 2>/dev/null
    echo "✅ Shell scripts made executable"
    
    echo ""
    echo "🔍 Verifying permissions..."
    echo "Environment files:"
    ls -la .env* 2>/dev/null || echo "No .env files found"
    
    echo ""
    echo "Key directories:"
    ls -ld lib/ app/ prisma/ 2>/dev/null
    
    echo ""
    echo "📊 Permission Summary:"
    echo "====================="
    echo "✅ Directories: 755 (rwxr-xr-x)"
    echo "✅ Files: 644 (rw-r--r--)"
    echo "✅ Environment files: 600 (rw-------)"
    echo "✅ Configuration files: 600 (rw-------)"
    echo "✅ Scripts: 755 (rwxr-xr-x)"
    
    echo ""
    echo "🔒 Security Check:"
    echo "================="
    
    # Check for overly permissive files
    world_writable=$(find . -path "./node_modules" -prune -o -type f -perm -002 -print 2>/dev/null | wc -l)
    if [ "$world_writable" -eq 0 ]; then
        echo "✅ No world-writable files found"
    else
        echo "⚠️  Found $world_writable world-writable files"
    fi
    
    # Check for files with group write
    group_writable=$(find . -path "./node_modules" -prune -o -type f -perm -020 -print 2>/dev/null | wc -l)
    if [ "$group_writable" -eq 0 ]; then
        echo "✅ No group-writable files found"
    else
        echo "⚠️  Found $group_writable group-writable files"
    fi
    
    echo ""
    echo "🎉 Permission management complete!"
}

# Function to check permissions
check_permissions() {
    echo "🔍 PERMISSION CHECK"
    echo "=================="
    echo ""
    
    echo "📋 Environment files:"
    ls -la .env* 2>/dev/null || echo "No .env files found"
    
    echo ""
    echo "📋 Key directories:"
    ls -ld lib/ app/ prisma/ 2>/dev/null
    
    echo ""
    echo "📋 Sample files:"
    ls -la lib/database-config.js app/layout.js package.json 2>/dev/null
    
    echo ""
    echo "🔒 Security check:"
    world_writable=$(find . -path "./node_modules" -prune -o -type f -perm -002 -print 2>/dev/null | wc -l)
    group_writable=$(find . -path "./node_modules" -prune -o -type f -perm -020 -print 2>/dev/null | wc -l)
    
    echo "World-writable files: $world_writable"
    echo "Group-writable files: $group_writable"
    
    if [ "$world_writable" -eq 0 ] && [ "$group_writable" -eq 0 ]; then
        echo "✅ Security check passed"
    else
        echo "⚠️  Security issues detected"
    fi
}

# Main script logic
case "$1" in
    "set"|"fix")
        set_permissions
        ;;
    "check"|"verify")
        check_permissions
        ;;
    *)
        echo "Usage: $0 {set|fix|check|verify}"
        echo ""
        echo "Commands:"
        echo "  set/fix   - Set optimal permissions for all files"
        echo "  check/verify - Check current permissions"
        echo ""
        echo "Examples:"
        echo "  $0 set     # Fix all permissions"
        echo "  $0 check   # Check current permissions"
        ;;
esac


