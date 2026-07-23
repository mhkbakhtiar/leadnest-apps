import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import konsumenService from '../services/konsumenService';
import followupService from '../services/followupService';
import { RootStackParamList } from '../../App';

type EditFollowupRouteProp = RouteProp<RootStackParamList, 'EditFollowupScreen'>;
type EditFollowupNavProp = NativeStackNavigationProp<RootStackParamList, 'EditFollowupScreen'>;

const EditFollowupScreen = () => {
  const navigation = useNavigation<EditFollowupNavProp>();
  const route = useRoute<EditFollowupRouteProp>();
  const { followup } = route.params;

  const [formData, setFormData] = useState({
    type: followup.type as 'whatsapp' | 'email' | 'visit' | 'socmed',
    notes: followup.notes || '',
    response: followup.response || '',
    next_followup_date: followup.next_followup_date || '',
    result: followup.result || '',
    status: (followup.followup_status?.name || 'Warm') as 'Cold' | 'Warm' | 'Hot' | 'Cancel' | 'Closing',
    visit_date: followup.visit_date || '',
  });

  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(
    followup.next_followup_date ? new Date(followup.next_followup_date.replace(' ', 'T')) : new Date(),
  );

  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showVisitTimePicker, setShowVisitTimePicker] = useState(false);
  const [tempVisitDate, setTempVisitDate] = useState(
    followup.visit_date ? new Date(followup.visit_date.replace(' ', 'T')) : new Date(),
  );

  const [konsumenResponses, setKonsumenResponses] = useState<any[]>([]);
  const [followupNotes, setFollowupNotes] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selectedResponses, setSelectedResponses] = useState<string[]>(
    followup.result ? followup.result.split(', ').map((r: string) => r.trim()) : [],
  );

  const [editableContact, setEditableContact] = useState({
    whatsapp: '',
    email: '',
    address: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  const [loadingKonsumen, setLoadingKonsumen] = useState(false);

  const shouldShowVisitDate = () => {
    return selectedResponses.some(
      (response) =>
        response.toLowerCase().includes('mau cek lokasi') ||
        response.toLowerCase().includes('jadwal cek lokasi'),
    );
  };

  useEffect(() => {
    fetchKonsumenData();
    fetchOptions();
  }, []);

  const fetchKonsumenData = async () => {
    try {
      setLoadingKonsumen(true);
      const data = await konsumenService.getKonsumenById(followup.konsumen_id);
      setEditableContact({
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        address: data.address || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        tiktok: data.tiktok || '',
      });
    } catch (error) {
      console.error('Error fetching konsumen:', error);
    } finally {
      setLoadingKonsumen(false);
    }
  };

  const updateKonsumenContact = async () => {
    try {
      await konsumenService.updateKonsumen(followup.konsumen_id, editableContact);
    } catch (error) {
      console.error('Error updating konsumen contact:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [responses, notes] = await Promise.all([
        konsumenService.getKonsumenResponses(),
        konsumenService.getFollowupNotes(),
      ]);
      setKonsumenResponses(responses);
      setFollowupNotes(notes);
    } catch (error) {
      console.error('Error fetching options:', error);
      showErrorToast('Gagal memuat data pilihan');
    } finally {
      setLoadingOptions(false);
    }
  };

  const toggleResponse = (responseName: string) => {
    let newSelectedResponses: string[];

    if (selectedResponses.includes(responseName)) {
      newSelectedResponses = selectedResponses.filter((r) => r !== responseName);
    } else {
      newSelectedResponses = [...selectedResponses, responseName];
    }

    setSelectedResponses(newSelectedResponses);

    const updatedFormData = { ...formData, result: newSelectedResponses.join(', ') };

    const needsVisitDate = newSelectedResponses.some(
      (response) =>
        response.toLowerCase().includes('mau cek lokasi') ||
        response.toLowerCase().includes('jadwal cek lokasi'),
    );

    if (!needsVisitDate) {
      updatedFormData.visit_date = '';
    }

    setFormData(updatedFormData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);

    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      setFormData({ ...formData, next_followup_date: `${year}-${month}-${day} ${hours}:${minutes}` });
    }

    if (Platform.OS === 'ios') setShowDatePicker(false);
  };

  const handleVisitDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowVisitDatePicker(false);

    if (selectedDate) {
      setTempVisitDate(selectedDate);
      if (Platform.OS === 'android') setShowVisitTimePicker(true);
    }
  };

  const handleVisitTimeChange = (event: any, selectedTime?: Date) => {
    setShowVisitTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempVisitDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      setFormData({ ...formData, visit_date: `${year}-${month}-${day} ${hours}:${minutes}` });
    }

    if (Platform.OS === 'ios') setShowVisitDatePicker(false);
  };

  const clearVisitDate = () => {
    setFormData({ ...formData, visit_date: '' });
    setTempVisitDate(new Date());
  };

  const clearNextFollowup = () => {
    setFormData({ ...formData, next_followup_date: '' });
    setTempDate(new Date());
  };

  const handleSave = async () => {
    if (!formData.notes) {
      showErrorToast('Keterangan followup harus diisi');
      return;
    }

    if (formData.notes === 'Berhasil terhubung' && selectedResponses.length === 0) {
      showErrorToast('Response konsumen harus dipilih minimal 1');
      return;
    }

    if (shouldShowVisitDate() && !formData.visit_date) {
      showErrorToast('Jadwal cek lokasi harus diisi');
      return;
    }

    try {
      setSaving(true);
      await updateKonsumenContact();
      await followupService.updateFollowup(followup.id, formData);
      showSuccessToast('Follow up berhasil diupdate');
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Cold: '#6b7280',
      Warm: '#f59e0b',
      Hot: '#ef4444',
      Cancel: '#374151',
      Closing: '#10b981',
    };
    return colors[status] || '#6b7280';
  };

  const renderContactField = () => {
    if (loadingKonsumen) {
      return <ActivityIndicator size="small" color="#312a7a" />;
    }

    switch (formData.type) {
      case 'whatsapp':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>WhatsApp Konsumen</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+62</Text>
              <TextInput
                style={styles.phoneInput}
                value={editableContact.whatsapp}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, '');
                  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
                  if (cleaned.startsWith('62')) cleaned = cleaned.slice(2);
                  setEditableContact({ ...editableContact, whatsapp: cleaned });
                }}
                placeholder="85xxxxxxxxxx"
                placeholderTextColor="#6b7280"
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.inputHint}>Nomor ini akan tersimpan ke data konsumen</Text>
          </View>
        );

      case 'email':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Konsumen</Text>
            <TextInput
              style={styles.input}
              value={editableContact.email}
              onChangeText={(text) => setEditableContact({ ...editableContact, email: text })}
              placeholder="email@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>Email ini akan tersimpan ke data konsumen</Text>
          </View>
        );

      case 'visit':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat Konsumen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editableContact.address}
              onChangeText={(text) => setEditableContact({ ...editableContact, address: text })}
              placeholder="Alamat lengkap"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.inputHint}>Alamat ini akan tersimpan ke data konsumen</Text>
          </View>
        );

      case 'socmed':
        return (
          <View style={styles.socialMediaGroup}>
            <Text style={styles.inputLabel}>Social Media Konsumen</Text>
            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.facebook}
                onChangeText={(text) => setEditableContact({ ...editableContact, facebook: text })}
                placeholder="Facebook URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.instagram}
                onChangeText={(text) => setEditableContact({ ...editableContact, instagram: text })}
                placeholder="Instagram URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.tiktok}
                onChangeText={(text) => setEditableContact({ ...editableContact, tiktok: text })}
                placeholder="TikTok URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.inputHint}>Social media ini akan tersimpan ke data konsumen</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Follow Up</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tipe Follow Up *</Text>
          <View style={styles.typeGrid}>
            {[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Email' },
              { value: 'visit', label: 'Kunjungan' },
              { value: 'socmed', label: 'Socmed' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeOptionNew, formData.type === type.value && styles.typeOptionNewActive]}
                onPress={() => setFormData({ ...formData, type: type.value as any })}
              >
                <Text
                  style={[
                    styles.typeOptionNewText,
                    formData.type === type.value && styles.typeOptionNewTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderContactField()}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Keterangan Followup *</Text>
          {loadingOptions ? (
            <ActivityIndicator size="small" color="#312a7a" />
          ) : (
            <View style={styles.dropdownContainer}>
              {followupNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.dropdownOption, formData.notes === note.name && styles.dropdownOptionActive]}
                  onPress={() => setFormData({ ...formData, notes: note.name })}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      formData.notes === note.name && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {note.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {formData.notes === 'Berhasil terhubung' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Response Konsumen *
              {selectedResponses.length > 0 && (
                <Text style={styles.selectedCount}> ({selectedResponses.length} dipilih)</Text>
              )}
            </Text>
            {loadingOptions ? (
              <ActivityIndicator size="small" color="#312a7a" />
            ) : (
              <View style={styles.dropdownContainer}>
                {konsumenResponses.map((response) => {
                  const isSelected = selectedResponses.includes(response.name);
                  return (
                    <TouchableOpacity
                      key={response.id}
                      style={[
                        styles.dropdownOption,
                        styles.dropdownOptionCheckbox,
                        isSelected && styles.dropdownOptionActive,
                      ]}
                      onPress={() => toggleResponse(response.name)}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
                      </View>
                      <Text
                        style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextActive]}
                      >
                        {response.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {selectedResponses.length > 0 && (
              <View style={styles.selectedResponsesContainer}>
                <Text style={styles.selectedResponsesLabel}>Dipilih:</Text>
                <Text style={styles.selectedResponsesText}>{selectedResponses.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {shouldShowVisitDate() && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Jadwal Cek Lokasi *</Text>

            {formData.visit_date ? (
              <View style={styles.dateTimeDisplay}>
                <Text style={styles.dateTimeText}>
                  {new Date(formData.visit_date.replace(' ', 'T')).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </Text>
                <TouchableOpacity style={styles.clearDateBtn} onPress={clearVisitDate}>
                  <Text style={styles.clearDateText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowVisitDatePicker(true)}>
              <Text style={styles.datePickerButtonText}>
                {formData.visit_date ? 'Ubah Tanggal & Waktu' : 'Pilih Tanggal & Waktu'}
              </Text>
            </TouchableOpacity>

            {showVisitDatePicker && (
              <DateTimePicker
                value={tempVisitDate}
                mode="date"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleVisitDateChange}
                minimumDate={new Date()}
              />
            )}

            {showVisitTimePicker && (
              <DateTimePicker
                value={tempVisitDate}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleVisitTimeChange}
              />
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Status Lead *</Text>
          <View style={styles.statusGrid}>
            {['Cold', 'Warm', 'Hot', 'Cancel', 'Closing'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  formData.status === status && [styles.statusOptionActive, { backgroundColor: getStatusColor(status) }],
                ]}
                onPress={() => setFormData({ ...formData, status: status as any })}
              >
                <Text
                  style={[styles.statusOptionText, formData.status === status && styles.statusOptionTextActive]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Follow Up Berikutnya</Text>

          {formData.next_followup_date ? (
            <View style={styles.dateTimeDisplay}>
              <Text style={styles.dateTimeText}>
                {new Date(formData.next_followup_date.replace(' ', 'T')).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Text>
              <TouchableOpacity style={styles.clearDateBtn} onPress={clearNextFollowup}>
                <Text style={styles.clearDateText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {formData.next_followup_date ? 'Ubah Tanggal & Waktu' : 'Pilih Tanggal & Waktu'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.buttonSecondaryText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonPrimaryText}>Simpan</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 28, color: '#312a7a', fontWeight: '400' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#312a7a' },
  body: { flex: 1, padding: 20 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: '#312a7a' },
  buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonSecondary: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
  buttonSecondaryText: { color: '#666', fontSize: 16, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeOptionNew: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: '48%',
  },
  typeOptionNewActive: { backgroundColor: '#312a7a', borderColor: '#312a7a' },
  typeOptionNewText: { fontSize: 13, color: '#374151', textAlign: 'center', fontWeight: '500' },
  typeOptionNewTextActive: { color: '#fff' },
  dropdownContainer: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, backgroundColor: '#fff' },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownOptionActive: { backgroundColor: '#f9fafb' },
  dropdownOptionText: { fontSize: 13, color: '#374151' },
  dropdownOptionTextActive: { color: '#312a7a', fontWeight: '500' },
  dropdownOptionCheckbox: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#312a7a', borderColor: '#312a7a' },
  checkboxIcon: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  selectedCount: { color: '#312a7a', fontSize: 12, fontWeight: '600' },
  selectedResponsesContainer: { marginTop: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8 },
  selectedResponsesLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  selectedResponsesText: { fontSize: 13, color: '#312a7a', lineHeight: 18 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  statusOptionActive: { borderColor: 'transparent' },
  statusOptionText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  statusOptionTextActive: { color: '#fff', fontWeight: '600' },
  datePickerButton: {
    backgroundColor: '#312a7a',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  dateTimeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateTimeText: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  clearDateBtn: { backgroundColor: '#ef4444', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  clearDateText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  socialMediaGroup: { marginTop: 0 },
  socialMediaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  socialMediaInput: { flex: 1 },
  inputHint: { fontSize: 12, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  phonePrefix: { fontSize: 15, color: '#1F2937', fontWeight: '600', marginRight: 6 },
  phoneInput: { flex: 1, fontSize: 15, color: '#1F2937', paddingVertical: 12 },
});

export default EditFollowupScreen;