'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X, RefreshCw, Languages } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLanguage } from '@/components/ui/language-toggle'

const DetailedPayrollSection = () => {
  const { language, toggleLanguage } = useLanguage()
  const [isTranslating, setIsTranslating] = useState(false)
  const [payrollData, setPayrollData] = useState([
    { id: 1, zhmare: 1, nawiSiyani: 'محەمەد حەسین ئەحمەد', briMoocha: 390000, padasht: 10000, siza: 25000, pukhteiMoocha: 375000, tebni: '' },
    { id: 2, zhmare: 2, nawiSiyani: 'ئایا محەسین ڕۆستەم', briMoocha: 425000, padasht: 0, siza: 25000, pukhteiMoocha: 400000, tebni: '' },
    { id: 3, zhmare: 3, nawiSiyani: 'سارا عەبدولڕەحمان فەتاح', briMoocha: 250000, padasht: 0, siza: 0, pukhteiMoocha: 250000, tebni: '' },
    { id: 4, zhmare: 4, nawiSiyani: 'ئازادان عەلی سەعید', briMoocha: 285000, padasht: 0, siza: 0, pukhteiMoocha: 285000, tebni: '' },
    { id: 5, zhmare: 5, nawiSiyani: 'سەرهەد عەلی حەسێن', briMoocha: 140000, padasht: 0, siza: 0, pukhteiMoocha: 140000, tebni: '' },
    { id: 6, zhmare: 6, nawiSiyani: 'هیوا ئەشماد محەمەد', briMoocha: 300000, padasht: 0, siza: 50000, pukhteiMoocha: 250000, tebni: '' },
    { id: 7, zhmare: 7, nawiSiyani: 'شازو حەمید', briMoocha: 300000, padasht: 0, siza: 0, pukhteiMoocha: 300000, tebni: '' },
    { id: 8, zhmare: 8, nawiSiyani: 'ئەمین عەلی محەمەدساڵح', briMoocha: 175000, padasht: 0, siza: 0, pukhteiMoocha: 175000, tebni: '' },
    { id: 9, zhmare: 9, nawiSiyani: 'دانا ئەحمەد ڕەشا', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 10, zhmare: 10, nawiSiyani: 'ناس شێرکۆ حان', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 11, zhmare: 11, nawiSiyani: 'فانیا فەرید سدیق', briMoocha: 275000, padasht: 0, siza: 0, pukhteiMoocha: 275000, tebni: '' },
    { id: 12, zhmare: 12, nawiSiyani: 'کۆرد خالد عەبدڵلە', briMoocha: 310000, padasht: 0, siza: 0, pukhteiMoocha: 310000, tebni: '' },
    { id: 13, zhmare: 13, nawiSiyani: 'یاریار ڕەئوف فەرەج', briMoocha: 300000, padasht: 0, siza: 0, pukhteiMoocha: 300000, tebni: '' },
    { id: 14, zhmare: 14, nawiSiyani: 'هادی ئەحمەد عەزیز', briMoocha: 425000, padasht: 0, siza: 25000, pukhteiMoocha: 400000, tebni: '' },
    { id: 15, zhmare: 15, nawiSiyani: 'یەکبان ئەحمەد حەسێن', briMoocha: 225000, padasht: 0, siza: 0, pukhteiMoocha: 225000, tebni: '' },
    { id: 16, zhmare: 16, nawiSiyani: 'ئارا ئەسعەد سالم', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 17, zhmare: 17, nawiSiyani: 'ئەرین ڕامین ئەحمەد', briMoocha: 100000, padasht: 0, siza: 0, pukhteiMoocha: 100000, tebni: '' },
    { id: 18, zhmare: 18, nawiSiyani: 'یەکتا عەبدالڕزاق', briMoocha: 175000, padasht: 0, siza: 0, pukhteiMoocha: 175000, tebni: '' },
    { id: 19, zhmare: 19, nawiSiyani: 'ژینۆ محەمەد ئەحمەد', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 20, zhmare: 20, nawiSiyani: 'ئەگەان عەلی', briMoocha: 285000, padasht: 0, siza: 0, pukhteiMoocha: 285000, tebni: '' },
    { id: 21, zhmare: 21, nawiSiyani: 'کارین نەبیاهیم', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 22, zhmare: 22, nawiSiyani: 'سمکۆ محەمەد کەریم', briMoocha: 275000, padasht: 0, siza: 0, pukhteiMoocha: 275000, tebni: '' },
    { id: 23, zhmare: 23, nawiSiyani: 'ئەویندار شێربان', briMoocha: 75000, padasht: 0, siza: 0, pukhteiMoocha: 75000, tebni: '' },
    { id: 24, zhmare: 24, nawiSiyani: 'زریان ئەحمەد', briMoocha: 75000, padasht: 0, siza: 0, pukhteiMoocha: 75000, tebni: '' },
    { id: 25, zhmare: 25, nawiSiyani: 'ڵوقیان', briMoocha: 200000, padasht: 0, siza: 0, pukhteiMoocha: 200000, tebni: '' },
    { id: 26, zhmare: 26, nawiSiyani: 'شەهیدار هادی', briMoocha: 175000, padasht: 0, siza: 0, pukhteiMoocha: 175000, tebni: '' },
    { id: 27, zhmare: 27, nawiSiyani: 'دوختیار ئاباهانی', briMoocha: 0, padasht: 0, siza: 0, pukhteiMoocha: 0, tebni: '' },
    { id: 28, zhmare: 28, nawiSiyani: 'کاروان ڕەشید', briMoocha: 0, padasht: 0, siza: 0, pukhteiMoocha: 0, tebni: '' }
  ])

  const [editingRow, setEditingRow] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newEntry, setNewEntry] = useState({
    nawiSiyani: '',
    briMoocha: '',
    padasht: 0,
    siza: 0,
    pukhteiMoocha: 0,
    tebni: ''
  })

  // Calculate totals
  const totals = payrollData.reduce((acc, item) => ({
    briMoocha: acc.briMoocha + (parseFloat(item.briMoocha) || 0),
    padasht: acc.padasht + (parseFloat(item.padasht) || 0),
    siza: acc.siza + (parseFloat(item.siza) || 0),
    pukhteiMoocha: acc.pukhteiMoocha + (parseFloat(item.pukhteiMoocha) || 0)
  }), { briMoocha: 0, padasht: 0, siza: 0, pukhteiMoocha: 0 })

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...payrollData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when salary, bonus, or penalty changes
    if (field === 'briMoocha' || field === 'padasht' || field === 'siza') {
      const salary = parseFloat(updatedData[rowIndex].briMoocha) || 0
      const bonus = parseFloat(updatedData[rowIndex].padasht) || 0
      const penalty = parseFloat(updatedData[rowIndex].siza) || 0
      updatedData[rowIndex].pukhteiMoocha = salary + bonus - penalty
    }
    
    setPayrollData(updatedData)
  }

  const startEditing = (rowIndex) => {
    setEditingRow(rowIndex)
  }

  const saveRowEdit = (rowIndex) => {
    setEditingRow(null)
    // Here you could also save to API
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Reset changes if needed
  }

  const deleteEntry = (id) => {
    if (confirm('دڵنیایت لە سڕینەوەی ئەم تۆمارە؟ / Are you sure you want to delete this record?')) {
      setPayrollData(prevData => prevData.filter(item => item.id !== id))
    }
  }

  const addNewEntry = () => {
    const newId = Math.max(...payrollData.map(item => item.id), 0) + 1
    const newZhmare = Math.max(...payrollData.map(item => item.zhmare), 0) + 1
    
    const salary = parseFloat(newEntry.briMoocha) || 0
    const bonus = parseFloat(newEntry.padasht) || 0
    const penalty = parseFloat(newEntry.siza) || 0
    const total = salary + bonus - penalty

    const entryToAdd = {
      id: newId,
      zhmare: newZhmare,
      ...newEntry,
      briMoocha: salary,
      padasht: bonus,
      siza: penalty,
      pukhteiMoocha: total
    }

    setPayrollData(prevData => [...prevData, entryToAdd])
    setNewEntry({
      nawiSiyani: '',
      briMoocha: '',
      padasht: 0,
      siza: 0,
      pukhteiMoocha: 0,
      tebni: ''
    })
    setIsAddDialogOpen(false)
  }

  const filteredData = payrollData.filter(item =>
    item.nawiSiyani.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isMobile = useIsMobile();

  function PayrollCardView({ data }) {
    return (
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.id} className="border rounded-lg p-2 bg-white shadow-sm">
            <div className="font-bold mb-1">{entry.nawiSiyani}</div>
            <div className="text-xs"><span className="font-semibold">ژمارە:</span> {entry.zhmare}</div>
            <div className="text-xs"><span className="font-semibold">بڕی مووچە:</span> {entry.briMoocha.toLocaleString()}</div>
            <div className="text-xs"><span className="font-semibold">پاداشت:</span> {entry.padasht.toLocaleString()}</div>
            <div className="text-xs"><span className="font-semibold">سزا:</span> {entry.siza.toLocaleString()}</div>
            <div className="text-xs"><span className="font-semibold">پوختەی مووچە:</span> {entry.pukhteiMoocha.toLocaleString()}</div>
            <div className="text-xs"><span className="font-semibold">تێبنی:</span> {entry.tebni}</div>
            {/* کردارەکان can be added here if needed */}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={language === 'kurdish' ? 'گەڕان بە ناوی کارمەند...' : 'Search by employee name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
              <Plus className="h-4 w-4" />
              زیادکردنی تۆماری نوێ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>زیادکردنی کارمەندی نوێ</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nawiSiyani">ناوی سیانی</Label>
                <Input
                  id="nawiSiyani"
                  value={newEntry.nawiSiyani}
                  onChange={(e) => setNewEntry({...newEntry, nawiSiyani: e.target.value})}
                  placeholder="ناوی کارمەند بنووسە"
                />
              </div>
              <div>
                <Label htmlFor="briMoocha">بڕی مووچە</Label>
                <Input
                  id="briMoocha"
                  type="number"
                  value={newEntry.briMoocha}
                  onChange={(e) => setNewEntry({...newEntry, briMoocha: e.target.value})}
                  placeholder="بڕی مووچە"
                />
              </div>
              <div>
                <Label htmlFor="padasht">پاداشت</Label>
                <Input
                  id="padasht"
                  type="number"
                  value={newEntry.padasht}
                  onChange={(e) => setNewEntry({...newEntry, padasht: e.target.value})}
                  placeholder="بڕی پاداشت"
                />
              </div>
              <div>
                <Label htmlFor="siza">سزا</Label>
                <Input
                  id="siza"
                  type="number"
                  value={newEntry.siza}
                  onChange={(e) => setNewEntry({...newEntry, siza: e.target.value})}
                  placeholder="بڕی سزا"
                />
              </div>
              <div>
                <Label htmlFor="tebni">تێبنی</Label>
                <Input
                  id="tebni"
                  value={newEntry.tebni}
                  onChange={(e) => setNewEntry({...newEntry, tebni: e.target.value})}
                  placeholder="تێبینی"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                پاشگەزبوونەوە
              </Button>
              <Button onClick={addNewEntry}>
                زیادکردن
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payroll Table */}
      {isMobile ? (
        <PayrollCardView data={filteredData} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'ژمارە' : 'No.'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'ناوی سیانی' : 'Full Name'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'بڕی مووچە' : 'Base Salary'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'پاداشت' : 'Bonus'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'سزا' : 'Deduction'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'پوختەی مووچە' : 'Total Salary'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'تێبنی' : 'Notes'}</th>
                    <th className="border border-gray-300 p-1 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{language === 'kurdish' ? 'کردارەکان' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry, rowIndex) => (
                    <tr key={entry.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'}>
                      <td className="border border-gray-300 p-1 px-2 text-center font-medium whitespace-nowrap overflow-hidden text-ellipsis">{entry.zhmare}</td>
                      <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingRow === rowIndex ? (
                        <input
                          value={entry.nawiSiyani}
                          onChange={(e) => handleCellEdit(rowIndex, 'nawiSiyani', e.target.value)}
                          className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                        />
                      ) : entry.nawiSiyani}</td>
                      <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">{editingRow === rowIndex ? (
                        <input
                          type="number"
                          value={entry.briMoocha}
                          onChange={(e) => handleCellEdit(rowIndex, 'briMoocha', e.target.value)}
                          className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500 text-right"
                        />
                      ) : entry.briMoocha.toLocaleString()}</td>
                      <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">{editingRow === rowIndex ? (
                        <input
                          type="number"
                          value={entry.padasht}
                          onChange={(e) => handleCellEdit(rowIndex, 'padasht', e.target.value)}
                          className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500 text-right"
                        />
                      ) : entry.padasht.toLocaleString()}</td>
                      <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">{editingRow === rowIndex ? (
                        <input
                          type="number"
                          value={entry.siza}
                          onChange={(e) => handleCellEdit(rowIndex, 'siza', e.target.value)}
                          className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500 text-right"
                        />
                      ) : entry.siza.toLocaleString()}</td>
                      <td className="border border-gray-300 p-1 px-2 text-right font-semibold text-green-700 whitespace-nowrap overflow-hidden text-ellipsis">{entry.pukhteiMoocha.toLocaleString()}</td>
                      <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingRow === rowIndex ? (
                        <input
                          value={entry.tebni}
                          onChange={(e) => handleCellEdit(rowIndex, 'tebni', e.target.value)}
                          className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                        />
                      ) : entry.tebni}</td>
                      <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center justify-center gap-2">
                          {editingRow === rowIndex ? (
                            <>
                              <Button size="sm" variant="default" onClick={() => saveRowEdit(rowIndex)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEditing(rowIndex)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-yellow-100 dark:bg-zinc-800 font-bold">
                    <td className="border border-gray-300 p-1 px-2 text-center">کۆی گشتی</td>
                    <td className="border border-gray-300 p-1 px-2"></td>
                    <td className="border border-gray-300 p-1 px-2 text-right text-blue-700">{totals.briMoocha.toLocaleString()}</td>
                    <td className="border border-gray-300 p-1 px-2 text-right text-green-700">{totals.padasht.toLocaleString()}</td>
                    <td className="border border-gray-300 p-1 px-2 text-right text-red-700">{totals.siza.toLocaleString()}</td>
                    <td className="border border-gray-300 p-1 px-2 text-right text-green-800 text-lg">{totals.pukhteiMoocha.toLocaleString()}</td>
                    <td className="border border-gray-300 p-1 px-2"></td>
                    <td className="border border-gray-300 p-1 px-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DetailedPayrollSection