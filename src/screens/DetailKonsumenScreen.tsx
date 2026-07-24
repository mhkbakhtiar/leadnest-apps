/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import konsumenService, { Konsumen } from '../services/konsumenService';
import followupService, { Followup } from '../services/followupService';
import { EditKonsumenModal } from './KonsumenScreen';

const capitalizeFirst = (text: string) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const budgetMap: { [key: string]: string } = {
  'below_500m': 'Kurang dari 500 jt',
  '500m_800m': '500 jt - 800 jt',
  '800m_1.2m': '800 jt - 1,2 M',
  '1.2m_3m': '1,2 M - 3 M',
  'above_3m': 'Lebih dari 3 M',
};

const DetailKonsumenScreen = ({ navigation, route }: any) => {
  const { konsumenId, konsumen: konsumenParam } = route.params || {};

  const [konsumen, setKonsumen] = useState<Konsumen | null>(konsumenParam || null);
  const [loading, setLoading] = useState(!konsumenParam);

  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [expandedFollowups, setExpandedFollowups] = useState<{ [key: string]: boolean }>({});

  const [showEditModal, setShowEditModal] = useState(false);

  const fetchKonsumen = async () => {
    try {
      setLoading(true);
      const data = await konsumenService.getKonsumenById(konsumenId);
      setKonsumen(data);
    } catch (error) {
      console.error('Error fetching konsumen:', error);
      showErrorToast('Gagal memuat data konsumen');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowups = async () => {
    try {
      setLoadingFollowups(true);
      const data = await followupService.getFollowupList({ konsumen_id: konsumenId });
      setFollowups(data);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoadingFollowups(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchKonsumen();
      fetchFollowups();
    }, [konsumenId])
  );

  const toggleFollowup = (id: string) => {
    setExpandedFollowups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFollowupTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      call: 'Telepon',
      email: 'Email',
      whatsapp: 'WhatsApp',
      visit: 'Kunjungan',
      other: 'Lainnya',
    };
    return capitalizeFirst(labels[type] || type);
  };

  const handleDelete = () => {
    if (!konsumen) return;
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus konsumen ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await konsumenService.deleteKonsumen(konsumen.id);
              showSuccessToast('Konsumen berhasil dihapus');
              navigation.goBack();
            } catch (error: any) {
              showErrorToast(error.message);
            }
          },
        },
      ]
    );
  };

  if (loading && !konsumen) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#312a7a" />
      </View>
    );
  }

  if (!konsumen) return null;

  const BackIcon = () => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <BackIcon />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {konsumen.name || 'Konsumen Tanpa Nama'}
          </Text>
          <Text style={styles.headerCode}>{konsumen.code}</Text>
        </View>

      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Contact Info */}
        {(konsumen.whatsapp || konsumen.email || konsumen.address || konsumen.city || konsumen.province) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Kontak</Text>

            {konsumen.whatsapp && (
              <View style={styles.row}>
                <Text style={styles.label}>WhatsApp</Text>
                <Text style={styles.value}>{konsumen.whatsapp}</Text>
              </View>
            )}
            {konsumen.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{konsumen.email}</Text>
              </View>
            )}
            {konsumen.address && (
              <View style={styles.row}>
                <Text style={styles.label}>Alamat</Text>
                <Text style={styles.value}>{konsumen.address}</Text>
              </View>
            )}
            {konsumen.city && (
              <View style={styles.row}>
                <Text style={styles.label}>Kota</Text>
                <Text style={styles.value}>{konsumen.city}</Text>
              </View>
            )}
            {konsumen.province && (
              <View style={styles.row}>
                <Text style={styles.label}>Provinsi</Text>
                <Text style={styles.value}>{konsumen.province}</Text>
              </View>
            )}
          </View>
        )}

        {/* Social Media */}
        {(konsumen.facebook || konsumen.instagram || konsumen.tiktok) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>

            {konsumen.facebook && (
              <View style={styles.row}>
                <Text style={styles.label}>Facebook</Text>
                <Text style={styles.value}>{konsumen.facebook}</Text>
              </View>
            )}
            {konsumen.instagram && (
              <View style={styles.row}>
                <Text style={styles.label}>Instagram</Text>
                <Text style={styles.value}>{konsumen.instagram}</Text>
              </View>
            )}
            {konsumen.tiktok && (
              <View style={styles.row}>
                <Text style={styles.label}>TikTok</Text>
                <Text style={styles.value}>{konsumen.tiktok}</Text>
              </View>
            )}
          </View>
        )}

        {/* Source */}
        {konsumen.source && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sumber</Text>
            <View style={styles.row}>
              <Text style={styles.value}>
                {(() => {
                  let list: any = konsumen.source;
                  if (typeof list === 'string') {
                    try {
                      list = JSON.parse(list);
                    } catch {
                      list = [];
                    }
                  }
                  return Array.isArray(list)
                    ? list
                        .map((item: string) =>
                          item.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                        )
                        .join(', ')
                    : '-';
                })()}
              </Text>
            </View>
          </View>
        )}

        {/* Budget */}
        {konsumen.budget && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget / Kesiapan Dana</Text>
            <View style={styles.row}>
              <Text style={styles.value}>{budgetMap[konsumen.budget] || konsumen.budget}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {konsumen.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <Text style={styles.value}>{konsumen.notes}</Text>
          </View>
        )}

        {/* Followup History */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Riwayat Follow Up</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{followups.length}</Text>
            </View>
          </View>

          {loadingFollowups ? (
            <ActivityIndicator color="#312a7a" style={{ marginTop: 16 }} />
          ) : followups.length === 0 ? (
            <View style={styles.emptyFollowup}>
              <Text style={styles.emptyFollowupText}>Belum ada riwayat follow up</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {followups.map((followup) => {
                const isExpanded = expandedFollowups[followup.id];
                return (
                  <View key={followup.id} style={styles.followupCard}>
                    <TouchableOpacity
                      style={styles.followupHeader}
                      onPress={() => toggleFollowup(followup.id.toString())}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.followupType}>{getFollowupTypeLabel(followup.type)}</Text>
                        <Text style={styles.followupDate}>
                          {new Date(followup.followup_date).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        {followup.followup_status?.name && (
                          <View style={styles.followupStatusBadge}>
                            <Text style={styles.followupStatusText}>{followup.followup_status.name}</Text>
                          </View>
                        )}
                        <Text style={styles.arrowIcon}>{isExpanded ? '▼' : '▶'}</Text>
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.followupContent}>
                        <Text style={styles.followupNotes}>Keterangan Follow Up : {followup.notes}</Text>

                        {followup.result && (
                          <View style={styles.followupResponse}>
                            <Text style={styles.followupResponseLabel}>Respon :</Text>
                            <Text style={styles.followupResponseText}>{followup.result}</Text>
                          </View>
                        )}

                        {followup.next_followup_date && (
                          <Text style={styles.followupNext}>
                            Followup Selanjutnya : {new Date(followup.next_followup_date).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </Text>
                        )}
                        {followup.visit_date && (
                          <Text style={styles.followupNext}>
                            Cek Lokasi : {new Date(followup.visit_date).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </Text>
                        )}

                        <TouchableOpacity
                          style={styles.followupEditBtn}
                          onPress={() => navigation.navigate('EditFollowupScreen', { followup })}
                        >
                          <Text style={styles.followupEditText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Hapus Konsumen</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('AddFollowupScreen', { konsumenId: konsumen.id })}
        >
          <Text style={styles.buttonSecondaryText}>+ Follow Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={styles.buttonPrimaryText}>Edit Konsumen</Text>
        </TouchableOpacity>
      </View>

      <EditKonsumenModal
        visible={showEditModal}
        konsumen={konsumen}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          fetchKonsumen();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    deleteButton: {
    marginTop: 4,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    },
    deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#165044',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  headerBtn: {
    padding: 4
  },
  headerBtnText: { fontSize: 30, color: '#fff', fontWeight: '300' },
  headerBtnIcon: { fontSize: 18, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerCode: { fontSize: 12, color: '#fff', marginTop: 2 },

  body: { flex: 1, padding: 20 },

  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { fontSize: 13, color: '#6b7280', width: 100, fontWeight: '500' },
  value: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },

  countBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },

  followupCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  followupContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  arrowIcon: { fontSize: 12, color: '#6b7280', marginLeft: 8 },
  followupType: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  followupDate: { fontSize: 12, color: '#6b7280' },
  followupStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, backgroundColor: '#e5e7eb' },
  followupStatusText: { color: '#4b5563', fontSize: 10, fontWeight: '500' },
  followupNotes: { fontSize: 13, color: '#374151', marginBottom: 8, lineHeight: 18 },
  followupResponse: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupResponseLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginBottom: 3 },
  followupResponseText: { fontSize: 12, color: '#374151', lineHeight: 16 },
  followupNext: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  followupEditBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followupEditText: { color: '#374151', fontSize: 12, fontWeight: '500' },

  emptyFollowup: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyFollowupText: { fontSize: 13, color: '#9ca3af' },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: '#165044' },
  buttonPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonSecondary: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
  buttonSecondaryText: { color: '#666', fontSize: 16, fontWeight: '600' },
});

export default DetailKonsumenScreen;