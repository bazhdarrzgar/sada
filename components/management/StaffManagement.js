import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import { DownloadButton } from '@/components/ui/download-button';
import { PrintButton } from '@/components/ui/print-button';

const columns = [
  { key: 'full_name', label: 'ناوی تەواو' },
  { key: 'mobile', label: 'مۆبایل' },
  { key: 'residence', label: 'نیشتەجێبوون' },
  { key: 'gender', label: 'ڕەگەز' },
  { key: 'id_number', label: 'ژ.وەسەڵ' },
  { key: 'certificate', label: 'بروانامە' },
  { key: 'age', label: 'تەمەن' },
  { key: 'school', label: 'قوتابخانە' },
  { key: 'preparatory', label: 'ئامادەیی' },
  { key: 'date', label: 'بەروار' },
  { key: 'department', label: 'بەش' },
  { key: 'pass', label: 'پاس' },
  { key: 'contract', label: 'عەقد' },
];

const defaultForm = {
  full_name: '',
  mobile: '',
  residence: '',
  gender: '',
  id_number: '',
  certificate: '',
  age: '',
  school: '',
  preparatory: '',
  date: '',
  department: '',
  pass: '',
  contract: '',
};

const StaffManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  // Load تۆمارەکانی ستاف
  const loadRecords = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/staff${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      alert('هەڵەیەک هەیە لە هێنانی داتاکان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    loadRecords(value);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for add/edit
  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData(record);
    } else {
      setEditingRecord(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData(defaultForm);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingRecord ? 'PUT' : 'POST';
      const url = editingRecord ? `/api/staff/${editingRecord.id}` : '/api/staff';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert(editingRecord ? 'تۆمارەکە نوێکرایەوە' : 'تۆمارەکە زیادکرا');
        closeModal();
        loadRecords(searchTerm);
      } else {
        throw new Error('Failed to save record');
      }
    } catch (error) {
      alert('هەڵەیەک هەیە لە پاشەکەوتکردنی تۆمارەکە');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`ئایا دڵنیایت لە سڕینەوەی تۆمارەکەی ${name}؟`)) {
      setLoading(true);
      try {
        const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('تۆمارەکە سڕایەوە');
          loadRecords(searchTerm);
        } else {
          throw new Error('Failed to delete record');
        }
      } catch (error) {
        alert('هەڵەیەک هەیە لە سڕینەوەی تۆمارەکە');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            تۆماری کارمەندان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="گەڕان لە تۆماری کارمەندان..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <DownloadButton 
                data={records}
                filename="staff-records"
                className="bg-green-600 hover:bg-green-700 text-white"
              />
              <PrintButton 
                data={records}
                filename="staff-records"
                title="Staff Records"
                titleKu="تۆمارەکانی ستاف"
                columns={[
                  { key: 'full_name', header: 'ناوی تەواو' },
                  { key: 'mobile', header: 'مۆبایل' },
                  { key: 'residence', header: 'نیشتەجێبوون' },
                  { key: 'gender', header: 'ڕەگەز' },
                  { key: 'id_number', header: 'ژ.وەسەڵ' },
                  { key: 'certificate', header: 'بروانامە' },
                  { key: 'age', header: 'تەمەن' },
                  { key: 'school', header: 'قوتابخانە' },
                  { key: 'preparatory', header: 'ئامادەیی' },
                  { key: 'date', header: 'بەروار' },
                  { key: 'department', header: 'بەش' },
                  { key: 'pass', header: 'پاس' },
                  { key: 'contract', header: 'عەقد' }
                ]}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900" disabled={loading}>
                    <Plus className="h-4 w-4" />
                    زیادکردنی تۆمارێکی نوێ
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'دەستکاری تۆمار' : 'زیادکردنی تۆمارێکی نوێ'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {columns.map((col) => (
                    <div key={col.key}>
                      <Label htmlFor={col.key}>{col.label}</Label>
                      <Input
                        id={col.key}
                        name={col.key}
                        value={formData[col.key] || ''}
                        onChange={handleInputChange}
                        required={col.key === 'full_name'}
                        placeholder={col.label + ' بنووسە'}
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                      پاشگەزبوونەوە
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'چاوەڕوان بە...' : (editingRecord ? 'نوێکردنەوە' : 'زیادکردن')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">چاوەڕوان بە...</p>
                </div>
              )}
              {!loading && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        {columns.map((col) => (
                          <th key={col.key} className="border border-gray-300 p-3 text-right font-semibold">{col.label}</th>
                        ))}
                        <th className="border border-gray-300 p-3 text-center font-semibold">کردارەکان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                            هیچ تۆمارێک نەدۆزرایەوە
                          </td>
                        </tr>
                      ) : (
                        records.map((record, index) => (
                          <tr key={record.id || index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}>
                            {columns.map((col) => (
                              <td key={col.key} className="border border-gray-300 p-3 text-sm text-gray-900">{record[col.key]}</td>
                            ))}
                            <td className="border border-gray-300 p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => openModal(record)} disabled={loading}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id, record.full_name)} disabled={loading}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement; 