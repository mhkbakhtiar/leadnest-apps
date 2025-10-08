import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import konsumenService, { Konsumen, KonsumenStatistics } from '../services/konsumenService';

const KonsumenScreen = () => {
  const [konsumenList, setKonsumenList] = useState<Konsumen[]>([]);
  const [statistics, setStatistics] = useState<KonsumenStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKonsumen, setSelectedKonsumen] = useState<Konsumen | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // getKonsumenList throws error jika gagal, jadi kita langsung dapat data
      const konsumenData = await konsumenService.getKonsumenList();
      const statsData = await konsumenService.getStatistics();
      
      console.log('Konsumen data:', konsumenData);
      console.log('Stats data:', statsData);

      // konsumenData adalah KonsumenListResponse
      setKonsumenList(konsumenData);
      
      // statsData adalah KonsumenStatistics
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data konsumen');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2 || text.length === 0) {
      try {
        // Service returns KonsumenListResponse
        const data = await konsumenService.getKonsumenList({ search: text });
        console.log('Search data:', data);
        if (data) {
          setKonsumenList(data);
        }
      } catch (error) {
        console.error('Error searching:', error);
      }
    }
  };

  const handleFilterStatus = async (status: string) => {
    setFilterStatus(status);
    try {
      // Service returns KonsumenListResponse
      const data = await konsumenService.getKonsumenList({ 
        status: status || undefined 
      });
      if (data) {
        setKonsumenList(data);
      }
    } catch (error) {
      console.error('Error filtering:', error);
      Alert.alert('Error', 'Gagal memfilter data');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: '#3B82F6',
      contacted: '#8B5CF6',
      interested: '#10B981',
      not_interested: '#EF4444',
      converted: '#059669',
      lost: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: 'Baru',
      contacted: 'Dihubungi',
      interested: 'Tertarik',
      not_interested: 'Tidak Tertarik',
      converted: 'Converted',
      lost: 'Lost',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#312a7a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konsumen</Text>
        <Text style={styles.headerSubtitle}>Kelola data konsumen Anda</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        {statistics && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#f0eef8' }]}>
              <Text style={styles.statNumber}>{statistics.total || 0}</Text>
              <Text style={styles.statLabel}>Total Konsumen</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
              <Text style={styles.statNumber}>{statistics.this_month || 0}</Text>
              <Text style={styles.statLabel}>Bulan Ini</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, email, atau telepon..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Filter Status */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
            onPress={() => handleFilterStatus('')}
          >
            <Text style={[styles.filterText, !filterStatus && styles.filterTextActive]}>
              Semua
            </Text>
          </TouchableOpacity>
          {['new', 'contacted', 'interested', 'converted'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => handleFilterStatus(status)}
            >
              <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
                {getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Konsumen List */}
        {konsumenList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery || filterStatus ? 'Tidak ada hasil' : 'Belum Ada Konsumen'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus
                ? 'Coba kata kunci lain atau hapus filter'
                : 'Mulai tambahkan konsumen pertama Anda'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {konsumenList.map((konsumen) => (
              <TouchableOpacity
                key={konsumen.id}
                style={styles.konsumenCard}
                onPress={() => {
                  setSelectedKonsumen(konsumen);
                  setShowDetailModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.konsumenHeader}>
                  <View style={styles.konsumenInfo}>
                    <Text style={styles.konsumenName}>{konsumen.name}</Text>
                    <Text style={styles.konsumenCode}>{konsumen.code}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(konsumen.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(konsumen.status)}</Text>
                  </View>
                </View>

                <View style={styles.konsumenFooter}>
                  <Text style={styles.dateText}>
                    Dibuat: {new Date(konsumen.created_at).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Tips</Text>
            <Text style={styles.infoText}>
              Klik konsumen untuk melihat detail dan melakukan follow-up
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Konsumen Modal */}
      <AddKonsumenModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchData();
        }}
      />

      {/* Detail Modal */}
      <DetailKonsumenModal
        visible={showDetailModal}
        konsumen={selectedKonsumen}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedKonsumen(null);
        }}
        onUpdate={() => {
          setShowDetailModal(false);
          fetchData();
        }}
      />
    </View>
  );
};

// Add Konsumen Modal Component
const AddKonsumenModal = ({ visible, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setFormData({ name: '', phone: '', email: '', company: '', address: '' });
    }
  }, [visible]);

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Nama dan telepon harus diisi');
      return;
    }

    try {
      setSaving(true);
      // Service returns KonsumenResponse
      const data = await konsumenService.createKonsumen(formData);
      if (data) {
        Alert.alert('Berhasil', 'Konsumen berhasil ditambahkan');
        setFormData({ name: '', phone: '', email: '', company: '', address: '' });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating konsumen:', error);
      Alert.alert('Error', error.message || 'Gagal menambahkan konsumen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tambah Konsumen</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Masukkan nama konsumen"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telepon *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="08xxxxxxxxxx"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Perusahaan</Text>
              <TextInput
                style={styles.input}
                value={formData.company}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholder="Nama perusahaan"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alamat</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Alamat lengkap"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.buttonSecondaryText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Detail Konsumen Modal Component
const DetailKonsumenModal = ({ visible, konsumen, onClose, onUpdate }: any) => {
  if (!konsumen) return null;

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: '#3B82F6',
      contacted: '#8B5CF6',
      interested: '#10B981',
      not_interested: '#EF4444',
      converted: '#059669',
      lost: '#6B7280',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: 'Baru',
      contacted: 'Dihubungi',
      interested: 'Tertarik',
      not_interested: 'Tidak Tertarik',
      converted: 'Converted',
      lost: 'Lost',
    };
    return labels[status] || status;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detail Konsumen</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailCard}>
              <Text style={styles.detailName}>{konsumen.name}</Text>
              <Text style={styles.detailCode}>{konsumen.code}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(konsumen.status), marginTop: 8 }]}>
                <Text style={styles.statusText}>{getStatusLabel(konsumen.status)}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Informasi Kontak</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Telepon:</Text>
                <Text style={styles.detailValue}>{konsumen.phone}</Text>
              </View>
              {konsumen.whatsapp && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>WhatsApp:</Text>
                  <Text style={styles.detailValue}>{konsumen.whatsapp}</Text>
                </View>
              )}
              {konsumen.email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{konsumen.email}</Text>
                </View>
              )}
            </View>

            {(konsumen.company || konsumen.position) && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Informasi Pekerjaan</Text>
                {konsumen.company && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Perusahaan:</Text>
                    <Text style={styles.detailValue}>{konsumen.company}</Text>
                  </View>
                )}
                {konsumen.position && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Posisi:</Text>
                    <Text style={styles.detailValue}>{konsumen.position}</Text>
                  </View>
                )}
              </View>
            )}

            {konsumen.address && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Alamat</Text>
                <Text style={styles.detailValue}>{konsumen.address}</Text>
                {konsumen.city && <Text style={styles.detailValue}>{konsumen.city}</Text>}
                {konsumen.province && <Text style={styles.detailValue}>{konsumen.province}</Text>}
              </View>
            )}

            {konsumen.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Catatan</Text>
                <Text style={styles.detailValue}>{konsumen.notes}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, { flex: 1 }]}
              onPress={onClose}
            >
              <Text style={styles.buttonPrimaryText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  konsumenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  konsumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  konsumenInfo: {
    flex: 1,
  },
  konsumenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  konsumenCode: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  konsumenDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  konsumenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fee',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#312a7a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#312a7a',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#312a7a',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  detailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#312a7a',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailCode: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#312a7a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default KonsumenScreen;