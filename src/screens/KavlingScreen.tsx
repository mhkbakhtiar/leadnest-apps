import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator,
  Modal, ScrollView, Image, StyleSheet as RNStyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import kavlingService, { KavlingItem, ProgresItem, DeadlineStatus, FilterItem } from '../services/kavlingService';
import authService from '../services/authService';

// ─── Icons ───────────────────────────────────────────────
const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="#999" strokeWidth="2" />
    <Path d="M21 21L16.65 16.65" stroke="#999" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FilterIcon = ({ color = '#165044' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ color = '#333' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ZoomIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Helpers ─────────────────────────────────────────────
const getDeadlineColor = (status: string) => {
  switch (status) {
    case 'terlambat': return { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' };
    case 'kritis':    return { bg: '#FEE2E2', text: '#DC2626', dot: '#DC2626' };
    case 'perhatian': return { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' };
    case 'selesai':   return { bg: '#D1FAE5', text: '#059669', dot: '#059669' };
    default:          return { bg: '#D1FAE5', text: '#059669', dot: '#059669' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Tersedia':       return { bg: '#D1FAE5', text: '#059669' };
    case 'Terjual':        return { bg: '#DBEAFE', text: '#2563EB' };
    case 'Selesai':        return { bg: '#E0E7FF', text: '#4F46E5' };
    case 'Tidak Tersedia': return { bg: '#F3F4F6', text: '#6B7280' };
    case 'Batal':          return { bg: '#FEE2E2', text: '#DC2626' };
    default:               return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const getProgressBarColor = (pct: number) => {
  if (pct >= 100) return '#059669';
  if (pct >= 50)  return '#165044';
  return '#F59E0B';
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Sub Components ──────────────────────────────────────
const DeadlineBadge = ({ ds }: { ds: DeadlineStatus }) => {
  const c = getDeadlineColor(ds.status);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: c.dot }]} />
      <Text style={[styles.badgeText, { color: c.text }]}>{ds.label}</Text>
    </View>
  );
};

const ProgressBar = ({ pct }: { pct: number }) => (
  <View style={styles.progressWrap}>
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, {
        width: `${Math.min(pct, 100)}%` as any,
        backgroundColor: getProgressBarColor(pct),
      }]} />
    </View>
    <Text style={styles.progressText}>{pct}%</Text>
  </View>
);

// ─── Image Viewer Modal ───────────────────────────────────
const ImageViewerModal = ({
  visible,
  uri,
  onClose,
}: {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}) => {
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.imgViewerOverlay}>
        {/* Tap anywhere to close */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        {/* Close button */}
        <TouchableOpacity style={styles.imgViewerClose} onPress={onClose}>
          <CloseIcon color="#fff" />
        </TouchableOpacity>

        {/* Full image */}
        <Image
          source={{ uri }}
          style={styles.imgViewerImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
};

// ─── Kavling Card ─────────────────────────────────────────
const KavlingCard = ({
  item,
  onPress,
}: {
  item: KavlingItem;
  onPress: (item: KavlingItem) => void;
}) => {
  const statusColor = getStatusColor(item.status);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>
            {item.cluster} {item.blok}-{item.nomor_kavling}
          </Text>
          <Text style={styles.cardProject} numberOfLines={1}>{item.project}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
        </View>
      </View>

      <ProgressBar pct={item.total_persentase} />

      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaLabel}>Progress</Text>
          <Text style={styles.cardMetaValue}>{item.total_progres}x update</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaLabel}>Deadline</Text>
          <Text style={styles.cardMetaValue}>{formatDate(item.deadline)}</Text>
        </View>
        {item.subkon_aktif > 0 && (
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaLabel}>Subkon</Text>
            <Text style={styles.cardMetaValue}>{item.subkon_aktif} aktif</Text>
          </View>
        )}
      </View>

      {item.deadline_status && (
        <View style={styles.cardDeadline}>
          <DeadlineBadge ds={item.deadline_status} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Progres Card ─────────────────────────────────────────
const ProgresCard = ({
  item,
  onPhotoPress,
}: {
  item: ProgresItem;
  onPhotoPress?: (uri: string) => void;
}) => (
  <View style={styles.progresCard}>
    <View style={styles.progresLeft}>
      <View style={styles.progresDateWrap}>
        <Text style={styles.progresDate}>{formatDate(item.tanggal)}</Text>
        <View style={styles.progresBadge}>
          <Text style={styles.progresBadgeText}>+{item.persentase}%</Text>
        </View>
      </View>
      <Text style={styles.progresKeterangan}>{item.keterangan}</Text>
      <Text style={styles.progresTotal}>Total: {item.total_sampai_ini}%</Text>
    </View>

    {item.foto_urls.length > 0 && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotoScroll}>
        {item.foto_urls.map((url, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onPhotoPress?.(url)}
            activeOpacity={0.85}
            style={styles.fotoThumbWrap}>
            <Image source={{ uri: url }} style={styles.fotoThumb} />
            {/* Zoom icon overlay */}
            <View style={styles.fotoZoomOverlay}>
              <ZoomIcon />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}
  </View>
);

// ─── Filter Modal ─────────────────────────────────────────
const FilterModal = ({
  visible,
  onClose,
  projects,
  selectedProject,
  selectedStatus,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  projects: FilterItem[];
  selectedProject: number | null;
  selectedStatus: string;
  onApply: (project: number | null, status: string) => void;
}) => {
  const [tmpProject, setTmpProject] = useState<number | null>(selectedProject);
  const [tmpStatus, setTmpStatus]   = useState(selectedStatus);

  const statusList = ['Semua', 'Tersedia', 'Terjual', 'Selesai', 'Tidak Tersedia', 'Batal'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Kavling</Text>
          <TouchableOpacity onPress={onClose}><CloseIcon /></TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <Text style={styles.filterSectionTitle}>Project</Text>
          <TouchableOpacity
            style={[styles.filterChip, tmpProject === null && styles.filterChipActive]}
            onPress={() => setTmpProject(null)}>
            <Text style={[styles.filterChipText, tmpProject === null && styles.filterChipTextActive]}>
              Semua Project
            </Text>
          </TouchableOpacity>
          {projects.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.filterChip, tmpProject === p.id && styles.filterChipActive]}
              onPress={() => setTmpProject(p.id)}>
              <Text style={[styles.filterChipText, tmpProject === p.id && styles.filterChipTextActive]}>
                {p.nama}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.filterSectionTitle, { marginTop: 20 }]}>Status</Text>
          <View style={styles.filterChipRow}>
            {statusList.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChipSmall, tmpStatus === s && styles.filterChipActive]}
                onPress={() => setTmpStatus(s)}>
                <Text style={[styles.filterChipText, tmpStatus === s && styles.filterChipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.btnReset}
            onPress={() => { setTmpProject(null); setTmpStatus('Semua'); }}>
            <Text style={styles.btnResetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnApply}
            onPress={() => { onApply(tmpProject, tmpStatus); onClose(); }}>
            <Text style={styles.btnApplyText}>Terapkan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Detail Modal ─────────────────────────────────────────
const DetailModal = ({
  visible,
  kavling,
  onClose,
}: {
  visible: boolean;
  kavling: KavlingItem | null;
  onClose: () => void;
}) => {
  const [progres, setProgres]               = useState<ProgresItem[]>([]);
  const [loading, setLoading]               = useState(false);
  const [deadlineStatus, setDeadlineStatus] = useState<DeadlineStatus | null>(null);
  const [selectedPhoto, setSelectedPhoto]   = useState<string | null>(null); // ✅ image viewer state

  useEffect(() => {
    if (visible && kavling) {
      fetchProgres(kavling.id);
    }
  }, [visible, kavling]);

  const fetchProgres = async (id: number) => {
    setLoading(true);
    try {
      const data = await kavlingService.getKavlingProgres(id);
      setProgres(data.progres);
      setDeadlineStatus(data.deadline_status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!kavling) return null;

  const statusColor = getStatusColor(kavling.status);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.detailContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.detailHeaderText}>
            <Text style={styles.detailTitle}>
              {kavling.cluster} {kavling.blok}-{kavling.nomor_kavling}
            </Text>
            <Text style={styles.detailSubtitle}>{kavling.project}</Text>
          </View>
          <View style={[styles.statusBadgeWhite, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{kavling.status}</Text>
          </View>
        </View>

        <ScrollView style={styles.detailBody} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Progress</Text>
              <Text style={styles.summaryValue}>{kavling.total_persentase}%</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Update</Text>
              <Text style={styles.summaryValue}>{kavling.total_progres}x</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Subkon Aktif</Text>
              <Text style={styles.summaryValue}>{kavling.subkon_aktif}</Text>
            </View>
          </View>

          {/* Progress Bar Besar */}
          <View style={styles.bigProgressWrap}>
            <View style={styles.bigProgressBg}>
              <View style={[styles.bigProgressFill, {
                width: `${Math.min(kavling.total_persentase, 100)}%` as any,
                backgroundColor: getProgressBarColor(kavling.total_persentase),
              }]} />
            </View>
          </View>

          {/* Deadline Status */}
          {deadlineStatus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Deadline</Text>
              <View style={[styles.deadlineCard, { backgroundColor: getDeadlineColor(deadlineStatus.status).bg }]}>
                <View style={styles.deadlineCardRow}>
                  <View>
                    <Text style={[styles.deadlineCardLabel, { color: getDeadlineColor(deadlineStatus.status).text }]}>
                      {deadlineStatus.label}
                    </Text>
                    <Text style={styles.deadlineCardDeadline}>
                      Deadline: {formatDate(kavling.deadline)}
                    </Text>
                  </View>
                  <View style={styles.deadlineSisaWrap}>
                    <Text style={[styles.deadlineSisaNum, { color: getDeadlineColor(deadlineStatus.status).text }]}>
                      {Math.abs(deadlineStatus.sisa_hari)}
                    </Text>
                    <Text style={styles.deadlineSisaLabel}>hari</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Riwayat Progres */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Progress</Text>
            {loading ? (
              <ActivityIndicator color="#165044" style={{ marginTop: 20 }} />
            ) : progres.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Belum ada data progress</Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {progres.map((p, idx) => (
                  <View key={p.id} style={styles.timelineItem}>
                    <View style={styles.timelineLine}>
                      <View style={styles.timelineDot} />
                      {idx < progres.length - 1 && <View style={styles.timelineConnector} />}
                    </View>
                    <View style={styles.timelineContent}>
                      {/* ✅ Pass onPhotoPress ke ProgresCard */}
                      <ProgresCard
                        item={p}
                        onPhotoPress={(uri) => setSelectedPhoto(uri)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* ✅ Image Viewer Modal */}
        <ImageViewerModal
          visible={!!selectedPhoto}
          uri={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────
const KavlingScreen = () => {
  const [kavlingList, setKavlingList]         = useState<KavlingItem[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [loadingMore, setLoadingMore]         = useState(false);
  const [search, setSearch]                   = useState('');
  const [searchInput, setSearchInput]         = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastPage, setLastPage]               = useState(1);
  const [total, setTotal]                     = useState(0);
  const [filterVisible, setFilterVisible]     = useState(false);
  const [detailVisible, setDetailVisible]     = useState(false);
  const [selectedKavling, setSelectedKavling] = useState<KavlingItem | null>(null);
  const [projects, setProjects]               = useState<FilterItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus]   = useState('Semua');

  // ✅ undefined = belum load, number = sudah load
  const [marketingId, setMarketingId] = useState<number | undefined>(undefined);

  // Load user sekali saat mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getUser();
      setMarketingId(user?.id ?? undefined);
    };
    loadUser();
  }, []);

  // Fetch data setelah marketingId sudah diload
  useEffect(() => {
    if (marketingId === undefined) return; // ✅ tunggu load selesai
    fetchProjects();
    fetchKavling(1, true);
  }, [marketingId]);

  // Re-fetch saat search / filter berubah
  useEffect(() => {
    if (marketingId === undefined) return; // ✅ guard
    fetchKavling(1, true);
  }, [search, selectedProject, selectedStatus]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProjects = async () => {
    try {
      const data = await kavlingService.getProjects(marketingId);
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchKavling = useCallback(async (page: number, reset: boolean = false) => {
    if (marketingId === undefined) return; // ✅ guard

    if (page === 1) reset ? setLoading(true) : setRefreshing(true);
    else setLoadingMore(true);

    try {
      const params: any = { page, per_page: 15 };

      if (marketingId)                params.marketing_id = marketingId;
      if (search)                     params.search       = search;
      if (selectedProject)            params.id_project   = selectedProject;
      if (selectedStatus !== 'Semua') params.status       = selectedStatus;

      const res = await kavlingService.getKavlingList(params);

      setKavlingList(prev => reset || page === 1 ? res.data : [...prev, ...res.data]);
      setCurrentPage(res.meta.current_page);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [marketingId, search, selectedProject, selectedStatus]); // ✅ semua dependency

  const onRefresh = useCallback(() => {
    if (marketingId === undefined) return; // ✅ guard
    fetchKavling(1, false);
  }, [fetchKavling]); // ✅ cukup fetchKavling karena sudah include semua dep

  const onEndReached = () => {
    if (!loadingMore && currentPage < lastPage) {
      fetchKavling(currentPage + 1);
    }
  };

  const onApplyFilter = (project: number | null, status: string) => {
    setSelectedProject(project);
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    selectedProject !== null,
    selectedStatus !== 'Semua',
  ].filter(Boolean).length;

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kavling</Text>
          <Text style={styles.headerSub}>{total} unit ditemukan</Text>
        </View>
      </View>

      {/* ── Search & Filter ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kavling, cluster, blok..."
            placeholderTextColor="#999"
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}>
          <FilterIcon color={activeFilterCount > 0 ? '#fff' : '#165044'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Active Filter Chips ── */}
      {(selectedStatus !== 'Semua' || selectedProject !== null) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
          {selectedProject !== null && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>
                {projects.find(p => p.id === selectedProject)?.nama}
              </Text>
              <TouchableOpacity onPress={() => setSelectedProject(null)}>
                <Text style={styles.activeChipClose}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          {selectedStatus !== 'Semua' && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{selectedStatus}</Text>
              <TouchableOpacity onPress={() => setSelectedStatus('Semua')}>
                <Text style={styles.activeChipClose}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── List ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#165044" />
          <Text style={styles.loadingText}>Memuat data kavling...</Text>
        </View>
      ) : (
        <FlatList
          data={kavlingList}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <KavlingCard
              item={item}
              onPress={(k) => { setSelectedKavling(k); setDetailVisible(true); }}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#165044']} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#165044" style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>Tidak ada kavling</Text>
              <Text style={styles.emptyText}>Coba ubah filter atau kata kunci pencarian</Text>
            </View>
          }
        />
      )}

      {/* ── Modals ── */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        projects={projects}
        selectedProject={selectedProject}
        selectedStatus={selectedStatus}
        onApply={onApplyFilter}
      />

      <DetailModal
        visible={detailVisible}
        kavling={selectedKavling}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#165044',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Search
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', padding: 0 },
  filterBtn: {
    width: 42, height: 42,
    borderRadius: 10,
    backgroundColor: '#F0FBF8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#165044',
  },
  filterBtnActive: { backgroundColor: '#165044' },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 8, width: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Active filter chips
  activeFilters: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  activeChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5F2', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    marginRight: 8, gap: 4,
  },
  activeChipText:  { fontSize: 12, color: '#165044', fontWeight: '500' },
  activeChipClose: { fontSize: 16, color: '#165044', fontWeight: '700', lineHeight: 18 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitleWrap: { flex: 1, marginRight: 8 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardProject:   { fontSize: 12, color: '#6B7280' },
  statusBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:    { fontSize: 11, fontWeight: '600' },
  cardFooter:    { flexDirection: 'row', gap: 16, marginTop: 10 },
  cardMeta:      {},
  cardMetaLabel: { fontSize: 11, color: '#9CA3AF' },
  cardMetaValue: { fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 1 },
  cardDeadline:  { marginTop: 10 },

  // Badge
  badge:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Progress
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg:   { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '700', color: '#374151', width: 36, textAlign: 'right' },

  // List
  listContent: { paddingTop: 12, paddingBottom: 24 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptyText:  { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },

  // Filter Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  modalBody:  { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  modalFooter: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  filterSectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', marginBottom: 8,
  },
  filterChipActive:     { backgroundColor: '#165044', borderColor: '#165044' },
  filterChipText:       { fontSize: 14, color: '#374151' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  filterChipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChipSmall: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  btnReset: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  btnResetText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  btnApply: {
    flex: 2, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#165044', alignItems: 'center',
  },
  btnApplyText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Detail Modal
  detailContainer: { flex: 1, backgroundColor: '#F3F4F6' },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#165044',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn:          { padding: 4 },
  detailHeaderText: { flex: 1 },
  detailTitle:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  detailSubtitle:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  statusBadgeWhite: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  detailBody:       { flex: 1 },

  // Summary
  summaryRow:  { flexDirection: 'row', gap: 10, padding: 16 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#165044' },

  // Big progress
  bigProgressWrap: { paddingHorizontal: 16, marginBottom: 4 },
  bigProgressBg:   { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  bigProgressFill: { height: 10, borderRadius: 5 },

  // Section
  section:      { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 10 },

  // Deadline card
  deadlineCard:         { borderRadius: 12, padding: 14 },
  deadlineCardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineCardLabel:    { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  deadlineCardDeadline: { fontSize: 12, color: '#6B7280' },
  deadlineSisaWrap:     { alignItems: 'center' },
  deadlineSisaNum:      { fontSize: 28, fontWeight: '800' },
  deadlineSisaLabel:    { fontSize: 11, color: '#6B7280' },

  // Timeline
  timeline:          { paddingBottom: 16 },
  timelineItem:      { flexDirection: 'row', gap: 12 },
  timelineLine:      { width: 20, alignItems: 'center' },
  timelineDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#165044', marginTop: 16 },
  timelineConnector: { flex: 1, width: 2, backgroundColor: '#D1FAE5', marginTop: 4 },
  timelineContent:   { flex: 1, paddingBottom: 12 },

  // Progres card
  progresCard:     { backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  progresLeft:     {},
  progresDateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  progresDate:     { fontSize: 12, fontWeight: '600', color: '#374151' },
  progresBadge:    { backgroundColor: '#D1FAE5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  progresBadgeText:    { fontSize: 11, fontWeight: '700', color: '#059669' },
  progresKeterangan:   { fontSize: 13, color: '#374151', marginBottom: 4 },
  progresTotal:        { fontSize: 11, color: '#9CA3AF' },
  fotoScroll:          { marginTop: 8 },

  // Foto thumbnail with zoom overlay
  fotoThumbWrap: {
    position: 'relative',
    marginRight: 6,
  },
  fotoThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  fotoZoomOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    padding: 4,
  },

  // Image Viewer
  imgViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgViewerClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 10,
  },
  imgViewerImage: {
    width: '100%',
    height: '80%',
  },
});

export default KavlingScreen;