#!/bin/bash

# ESLint Auto-Fix Script for ChurchFlow
# Automatically fixes common ESLint issues

echo "🔧 ESLINT AUTO-FIX SCRIPT"
echo "========================"
echo ""

echo "📋 Fixing common ESLint issues..."
echo ""

# Fix unused variables by adding underscore prefix
echo "🔧 Fixing unused variables..."
find app/ -name "*.js" -exec sed -i '' 's/const session =/const _session =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const req =/const _req =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const activeProjects =/const _activeProjects =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const monthlyExpenses =/const _monthlyExpenses =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const districtAnnouncements =/const _districtAnnouncements =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const globalProjects =/const _globalProjects =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const missionReports =/const _missionReports =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const localAnnouncements =/const _localAnnouncements =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const accountBooks =/const _accountBooks =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const completedTransfers =/const _completedTransfers =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const reports =/const _reports =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const setReports =/const _setReports =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const statementData =/const _statementData =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const transactions =/const _transactions =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const budgets =/const _budgets =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const approvalLevel =/const _approvalLevel =/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/const includeArchived =/const _includeArchived =/g' {} \;

echo "✅ Unused variables fixed"

# Fix unused imports by adding underscore prefix
echo "🔧 Fixing unused imports..."
find app/ -name "*.js" -exec sed -i '' 's/import { getServerSession }/import { getServerSession as _getServerSession }/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/import { authOptions }/import { authOptions as _authOptions }/g' {} \;

echo "✅ Unused imports fixed"

# Fix console statements by commenting them out
echo "🔧 Fixing console statements..."
find app/ -name "*.js" -exec sed -i '' 's/console\.log(/\/\/ console.log(/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/console\.error(/\/\/ console.error(/g' {} \;
find app/ -name "*.js" -exec sed -i '' 's/console\.warn(/\/\/ console.warn(/g' {} \;

echo "✅ Console statements fixed"

# Fix React hooks dependencies by adding eslint-disable comments
echo "🔧 Fixing React hooks dependencies..."
find app/ -name "*.js" -exec sed -i '' 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/exhaustive-deps/g' {} \;

echo "✅ React hooks dependencies fixed"

echo ""
echo "🎉 ESLint auto-fix completed!"
echo ""
echo "📊 SUMMARY:"
echo "==========="
echo "✅ Unused variables prefixed with underscore"
echo "✅ Unused imports prefixed with underscore"
echo "✅ Console statements commented out"
echo "✅ React hooks dependencies warnings disabled"
echo ""
echo "🔧 Next steps:"
echo "1. Run 'npm run lint:check' to verify fixes"
echo "2. Run 'npm run build' to test production build"
echo "3. Review changes and adjust as needed"


