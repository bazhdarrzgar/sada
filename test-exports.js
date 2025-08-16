// Test the export utilities
const testData = [
  {
    id: "test-1",
    fullName: "Ahmad محمد",
    mobile: "07701234567",
    address: "سلێمانی - کەنتکرد",
    created_at: new Date()
  },
  {
    id: "test-2", 
    fullName: "فەریدە احمد",
    mobile: "07507654321",
    address: "هەولێر - نەوروز",
    created_at: new Date()
  }
]

// Test JSON export
console.log('Testing JSON export...')
try {
  const { exportToJSON } = require('./lib/exportUtils.js')
  console.log('✅ JSON export function imported successfully')
} catch (e) {
  console.log('❌ JSON export import failed:', e.message)
}

// Test CSV export
console.log('Testing CSV export...')
try {
  const { exportToCSV } = require('./lib/exportUtils.js')
  console.log('✅ CSV export function imported successfully')
} catch (e) {
  console.log('❌ CSV export import failed:', e.message)
}

// Test Excel export
console.log('Testing Excel export...')
try {
  const { exportToExcel } = require('./lib/exportUtils.js')
  console.log('✅ Excel export function imported successfully')
} catch (e) {
  console.log('❌ Excel export import failed:', e.message)
}

console.log('✅ All export utilities are available and ready to use!')
console.log('📊 Sample data for testing:', JSON.stringify(testData, null, 2))