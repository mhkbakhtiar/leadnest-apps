/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Platform,
  FlatList
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import konsumenService, { Konsumen, KonsumenStatistics } from '../services/konsumenService';
import followupService, { Followup, CreateFollowupData } from '../services/followupService';
import authService from '../services/authService';

import _ from 'lodash';


const sourceOptions = [
  { label: 'Distribusi Kantor', value: 'distribusi_kantor' },
  { label: 'Iklan Meta', value: 'iklan_meta' },
  { label: 'Iklan Google', value: 'iklan_google' },
  { label: 'Billboard / Banner', value: 'billboard_banner' },
  { label: 'Event / Open Table', value: 'event_open_table' },
  { label: 'Walk In', value: 'walk_in' },
  { label: 'Canvassing', value: 'canvassing' },
  { label: 'Referral', value: 'referral' },
  { label: 'Website', value: 'website' },
  { label: 'Sosmed', value: 'sosmed' },
];

const statusOptions = [
  { label: 'Semua', value: '', color: '#6b7280' },
  { label: 'Cold', value: 'Cold', color: '#6b7280' },
  { label: 'Warm', value: 'Warm', color: '#f59e0b' },
  { label: 'Hot', value: 'Hot', color: '#ef4444' },
  { label: 'Cancel', value: 'Cancel', color: '#374151' },
  { label: 'Closing', value: 'Closing', color: '#10b981' },
];

export const budgetOptions = [
  { value: 'below_500m', label: 'Kurang dari 500 jt' },
  { value: '500m_800m', label: '500 jt - 800 jt' },
  { value: '800m_1.2m', label: '800 jt - 1,2 M' },
  { value: '1.2m_3m', label: '1,2 M - 3 M' },
  { value: 'above_3m', label: 'Lebih dari 3 M' }
];

// Data provinsi dan kota
export const locationData = {
  'Aceh': [
    'Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam',
    'Aceh Besar', 'Aceh Barat', 'Aceh Selatan', 'Aceh Timur', 'Aceh Utara',
    'Bireuen', 'Pidie', 'Aceh Jaya', 'Nagan Raya', 'Simeulue'
  ],
  'Sumatera Utara': [
    'Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', 'Padang Sidimpuan',
    'Tanjungbalai', 'Sibolga', 'Gunungsitoli', 'Deli Serdang', 'Serdang Bedagai',
    'Asahan', 'Labuhanbatu', 'Tapanuli Utara', 'Tapanuli Tengah', 'Tapanuli Selatan',
    'Toba', 'Samosir', 'Karo', 'Dairi', 'Mandailing Natal'
  ],
  'Sumatera Barat': [
    'Padang', 'Bukittinggi', 'Payakumbuh', 'Solok', 'Pariaman',
    'Padang Panjang', 'Sawahlunto', 'Agam', 'Tanah Datar', 'Lima Puluh Kota',
    'Pasaman', 'Pasaman Barat', 'Sijunjung', 'Dharmasraya', 'Pesisir Selatan'
  ],
  'Riau': [
    'Pekanbaru', 'Dumai', 'Bengkalis', 'Indragiri Hilir', 'Indragiri Hulu',
    'Kampar', 'Kuantan Singingi', 'Pelalawan', 'Rokan Hilir', 'Rokan Hulu',
    'Siak', 'Kepulauan Meranti'
  ],
  'Kepulauan Riau': [
    'Batam', 'Tanjung Pinang', 'Bintan', 'Karimun', 'Lingga',
    'Natuna', 'Anambas'
  ],
  'Jambi': [
    'Jambi', 'Sungai Penuh', 'Batanghari', 'Bungo', 'Kerinci',
    'Merangin', 'Muaro Jambi', 'Sarolangun', 'Tanjung Jabung Barat',
    'Tanjung Jabung Timur', 'Tebo'
  ],
  'Sumatera Selatan': [
    'Palembang', 'Prabumulih', 'Pagar Alam', 'Lubuklinggau',
    'Banyuasin', 'Empat Lawang', 'Lahat', 'Muara Enim', 'Musi Banyuasin',
    'Musi Rawas', 'Ogan Ilir', 'Ogan Komering Ilir', 'Ogan Komering Ulu'
  ],
  'Kepulauan Bangka Belitung': [
    'Pangkal Pinang', 'Bangka', 'Bangka Barat', 'Bangka Selatan',
    'Bangka Tengah', 'Belitung', 'Belitung Timur'
  ],
  'Bengkulu': [
    'Bengkulu', 'Bengkulu Selatan', 'Bengkulu Tengah', 'Bengkulu Utara',
    'Kaur', 'Kepahiang', 'Lebong', 'Mukomuko', 'Rejang Lebong', 'Seluma'
  ],
  'Lampung': [
    'Bandar Lampung', 'Metro', 'Lampung Barat', 'Lampung Selatan',
    'Lampung Tengah', 'Lampung Timur', 'Lampung Utara', 'Pesawaran',
    'Pringsewu', 'Tanggamus', 'Tulang Bawang', 'Way Kanan', 'Mesuji', 'Pesisir Barat'
  ],
  'DKI Jakarta': [
    'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan',
    'Jakarta Timur', 'Kepulauan Seribu'
  ],
  'Banten': [
    'Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon',
    'Lebak', 'Pandeglang', 'Kabupaten Tangerang', 'Kabupaten Serang'
  ],
  'Jawa Barat': [
    'Bandung', 'Bekasi', 'Bogor', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya',
    'Banjar', 'Cimahi', 'Ciamis', 'Cianjur', 'Garut', 'Indramayu', 'Karawang',
    'Kuningan', 'Majalengka', 'Purwakarta', 'Subang', 'Sumedang',
    'Kabupaten Bandung', 'Kabupaten Bandung Barat', 'Kabupaten Bekasi',
    'Kabupaten Bogor', 'Kabupaten Cirebon', 'Kabupaten Sukabumi', 'Kabupaten Tasikmalaya',
    'Pangandaran'
  ],
  'Jawa Tengah': [
    'Semarang', 'Surakarta', 'Magelang', 'Salatiga', 'Pekalongan', 'Tegal',
    'Banjarnegara', 'Banyumas', 'Batang', 'Blora', 'Boyolali', 'Brebes',
    'Cilacap', 'Demak', 'Grobogan', 'Jepara', 'Karanganyar', 'Kebumen',
    'Kendal', 'Klaten', 'Kudus', 'Purbalingga', 'Purworejo', 'Rembang',
    'Sragen', 'Sukoharjo', 'Temanggung', 'Wonogiri', 'Wonosobo', 'Pati',
    'Kabupaten Magelang', 'Kabupaten Pekalongan', 'Kabupaten Semarang', 'Kabupaten Tegal'
  ],
  'DI Yogyakarta': [
    'Yogyakarta', 'Bantul', 'Gunungkidul', 'Kulon Progo', 'Sleman'
  ],
  'Jawa Timur': [
    'Surabaya', 'Malang', 'Kediri', 'Blitar', 'Madiun', 'Mojokerto', 'Pasuruan',
    'Probolinggo', 'Batu', 'Bangkalan', 'Banyuwangi', 'Bojonegoro', 'Bondowoso',
    'Gresik', 'Jember', 'Jombang', 'Lamongan', 'Lumajang', 'Magetan', 'Nganjuk',
    'Ngawi', 'Pacitan', 'Pamekasan', 'Ponorogo', 'Sampang', 'Sidoarjo', 'Situbondo',
    'Sumenep', 'Trenggalek', 'Tuban', 'Tulungagung',
    'Kabupaten Blitar', 'Kabupaten Kediri', 'Kabupaten Madiun', 'Kabupaten Malang',
    'Kabupaten Mojokerto', 'Kabupaten Pasuruan', 'Kabupaten Probolinggo'
  ],
  'Bali': [
    'Denpasar', 'Badung', 'Bangli', 'Buleleng', 'Gianyar',
    'Jembrana', 'Karangasem', 'Klungkung', 'Tabanan'
  ],
  'Nusa Tenggara Barat': [
    'Mataram', 'Bima', 'Bima (Kabupaten)', 'Dompu', 'Lombok Barat',
    'Lombok Tengah', 'Lombok Timur', 'Lombok Utara', 'Sumbawa',
    'Sumbawa Barat'
  ],
  'Nusa Tenggara Timur': [
    'Kupang', 'Alor', 'Belu', 'Ende', 'Flores Timur', 'Kupang (Kabupaten)',
    'Lembata', 'Malaka', 'Manggarai', 'Manggarai Barat', 'Manggarai Timur',
    'Nagekeo', 'Ngada', 'Rote Ndao', 'Sabu Raijua', 'Sikka', 'Sumba Barat',
    'Sumba Barat Daya', 'Sumba Tengah', 'Sumba Timur', 'Timor Tengah Selatan',
    'Timor Tengah Utara'
  ],
  'Kalimantan Barat': [
    'Pontianak', 'Singkawang', 'Bengkayang', 'Kapuas Hulu', 'Kayong Utara',
    'Ketapang', 'Kubu Raya', 'Landak', 'Melawi', 'Mempawah', 'Sambas',
    'Sanggau', 'Sekadau', 'Sintang'
  ],
  'Kalimantan Tengah': [
    'Palangkaraya', 'Barito Selatan', 'Barito Timur', 'Barito Utara',
    'Gunung Mas', 'Kapuas', 'Katingan', 'Kotawaringin Barat', 'Kotawaringin Timur',
    'Lamandau', 'Murung Raya', 'Pulang Pisau', 'Seruyan', 'Sukamara'
  ],
  'Kalimantan Selatan': [
    'Banjarmasin', 'Banjarbaru', 'Balangan', 'Banjar', 'Barito Kuala',
    'Hulu Sungai Selatan', 'Hulu Sungai Tengah', 'Hulu Sungai Utara',
    'Kotabaru', 'Tabalong', 'Tanah Bumbu', 'Tanah Laut', 'Tapin'
  ],
  'Kalimantan Timur': [
    'Samarinda', 'Balikpapan', 'Bontang', 'Berau', 'Kutai Barat',
    'Kutai Kartanegara', 'Kutai Timur', 'Mahakam Ulu', 'Paser', 'Penajam Paser Utara'
  ],
  'Kalimantan Utara': [
    'Tarakan', 'Bulungan', 'Malinau', 'Nunukan', 'Tana Tidung'
  ],
  'Sulawesi Utara': [
    'Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Bolaang Mongondow',
    'Bolaang Mongondow Selatan', 'Bolaang Mongondow Timur', 'Bolaang Mongondow Utara',
    'Kepulauan Sangihe', 'Kepulauan Siau Tagulandang Biaro', 'Kepulauan Talaud',
    'Minahasa', 'Minahasa Selatan', 'Minahasa Tenggara', 'Minahasa Utara'
  ],
  'Sulawesi Tengah': [
    'Palu', 'Banggai', 'Banggai Kepulauan', 'Banggai Laut', 'Buol',
    'Donggala', 'Morowali', 'Morowali Utara', 'Parigi Moutong', 'Poso',
    'Sigi', 'Tojo Una-Una', 'Toli-Toli'
  ],
  'Sulawesi Selatan': [
    'Makassar', 'Palopo', 'Parepare', 'Bantaeng', 'Barru', 'Bone',
    'Bulukumba', 'Enrekang', 'Gowa', 'Jeneponto', 'Kepulauan Selayar',
    'Luwu', 'Luwu Timur', 'Luwu Utara', 'Maros', 'Pangkajene dan Kepulauan',
    'Pinrang', 'Sidenreng Rappang', 'Sinjai', 'Soppeng', 'Takalar', 'Tana Toraja',
    'Toraja Utara', 'Wajo'
  ],
  'Sulawesi Tenggara': [
    'Kendari', 'Bau-Bau', 'Bombana', 'Buton', 'Buton Selatan', 'Buton Tengah',
    'Buton Utara', 'Kolaka', 'Kolaka Timur', 'Kolaka Utara', 'Konawe',
    'Konawe Kepulauan', 'Konawe Selatan', 'Konawe Utara', 'Muna', 'Muna Barat', 'Wakatobi'
  ],
  'Gorontalo': [
    'Gorontalo', 'Boalemo', 'Bone Bolango', 'Gorontalo (Kabupaten)',
    'Gorontalo Utara', 'Pohuwato'
  ],
  'Sulawesi Barat': [
    'Mamuju', 'Majene', 'Mamasa', 'Mamuju (Kabupaten)', 'Mamuju Tengah',
    'Polewali Mandar'
  ],
  'Maluku': [
    'Ambon', 'Tual', 'Buru', 'Buru Selatan', 'Kepulauan Aru',
    'Maluku Barat Daya', 'Maluku Tengah', 'Maluku Tenggara',
    'Maluku Tenggara Barat', 'Seram Bagian Barat', 'Seram Bagian Timur'
  ],
  'Maluku Utara': [
    'Ternate', 'Tidore Kepulauan', 'Halmahera Barat', 'Halmahera Selatan',
    'Halmahera Tengah', 'Halmahera Timur', 'Halmahera Utara', 'Kepulauan Sula',
    'Pulau Morotai', 'Pulau Taliabu'
  ],
  'Papua Barat': [
    'Manokwari', 'Sorong', 'Fakfak', 'Kaimana', 'Manokwari Selatan',
    'Maybrat', 'Pegunungan Arfak', 'Raja Ampat', 'Sorong Selatan',
    'Tambrauw', 'Teluk Bintuni', 'Teluk Wondama'
  ],
  'Papua Barat Daya': [
    'Sorong', 'Fakfak', 'Kaimana', 'Maybrat', 'Raja Ampat',
    'Sorong Selatan', 'Tambrauw', 'Teluk Bintuni'
  ],
  'Papua': [
    'Jayapura', 'Asmat', 'Biak Numfor', 'Boven Digoel', 'Deiyai',
    'Dogiyai', 'Intan Jaya', 'Jayapura (Kabupaten)', 'Jayawijaya',
    'Keerom', 'Kepulauan Yapen', 'Lanny Jaya', 'Mamberamo Raya',
    'Mamberamo Tengah', 'Mappi', 'Merauke', 'Mimika', 'Nabire',
    'Nduga', 'Paniai', 'Pegunungan Bintang', 'Puncak', 'Puncak Jaya',
    'Sarmi', 'Supiori', 'Tolikara', 'Waropen', 'Yahukimo', 'Yalimo'
  ],
  'Papua Tengah': [
    'Nabire', 'Deiyai', 'Dogiyai', 'Intan Jaya', 'Mimika',
    'Paniai', 'Puncak', 'Puncak Jaya'
  ],
  'Papua Pegunungan': [
    'Jayawijaya', 'Lanny Jaya', 'Mamberamo Tengah', 'Nduga',
    'Tolikara', 'Yahukimo', 'Yalimo', 'Pegunungan Bintang'
  ],
  'Papua Selatan': [
    'Merauke', 'Asmat', 'Boven Digoel', 'Mappi'
  ]
};

const capitalizeFirst = (text: string) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const KonsumenScreen = () => {
  const [konsumenList, setKonsumenList] = useState<Konsumen[]>([]);
  const [statistics, setStatistics] = useState<KonsumenStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKonsumen, setSelectedKonsumen] = useState<Konsumen | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filterBudget, setFilterBudget] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [showBudgetFilterModal, setShowBudgetFilterModal] = useState(false);
  const [showProjectFilterModal, setShowProjectFilterModal] = useState(false);

  const [mitras, setMitras] = useState<any[]>([]); // NEW: List mitras
  const [loadingMitras, setLoadingMitras] = useState(false); // NEW: Loading state

  const [filterExpanded, setFilterExpanded] = useState(false);

  const [filterDateFrom, setFilterDateFrom] = useState<string>(''); // format YYYY-MM-DD
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState(new Date());
  const [tempDateTo, setTempDateTo] = useState(new Date());


  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });

  const [filterSource, setFilterSource] = useState('');
  const [showSourceModal, setShowSourceModal] = useState(false);

  // Search Icon Component
  const SearchIcon = ({ size = 20, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle 
        cx="11" 
        cy="11" 
        r="7" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <Path 
        d="M20 20L16.5 16.5" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </Svg>
  );

  const CloseIcon = ({ size = 20, color = '#fff' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6L18 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M18 6L6 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );


  useEffect(() => {
    fetchData();
    fetchMitras();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const konsumenData = await konsumenService.getKonsumenList();
      const statsData = await konsumenService.getStatistics();
      
      setKonsumenList(konsumenData.data);
      setStatistics(statsData);
      setPagination(konsumenData.meta);
    } catch (error) {
      console.error('Error loading data:', error);
      showErrorToast('Gagal memuat data konsumen');
    } finally {
      setLoading(false);
    }
  };

  const fetchMitras = async () => {
    try {
      setLoadingMitras(true);
      const userData = await authService.getUser();
      if (!userData) {
        showErrorToast('Gagal mendapatkan data bisnis / project');
        setLoadingMitras(false);
        return;
      }
      const data = await konsumenService.getMitras(userData.id.toString());
      setMitras(data);
      
    } catch (error: any) {
      showErrorToast('Gagal memuat daftar mitra');
    } finally {
      setLoadingMitras(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getBudgetLabel = () => {
    if (!filterBudget) return 'Semua Budget';
    const budget = budgetOptions.find(b => b.value === filterBudget);
    return budget ? budget.label : 'Semua Budget';
  };
  
  const getProjectLabel = () => {
    if (!filterProject) return 'Semua Project';
    const project = mitras.find(p => p.id === filterProject);
    
    return project ? project.name : 'Semua Project';
  };

  const debouncedSearch = useRef(
    _.debounce((text) => {
      fetchKonsumenList(
        filterStatus,
        filterSource,
        filterBudget,
        filterProject,
        1,
        pagination.per_page,
        false,
        text
      );
    }, 500)
  ).current;

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.length > 2 || text.length === 0) {
      debouncedSearch(text);
    }
  };

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value);
    fetchKonsumenList(value, filterSource, filterBudget, filterProject, 1, pagination.per_page, false, searchQuery, filterDateFrom, filterDateTo);
  };

  const handleFilterBudget = (value: string) => {
    setFilterBudget(value);
    fetchKonsumenList(filterStatus, filterSource, value, filterProject, 1, pagination.per_page, false, searchQuery, filterDateFrom, filterDateTo);
  };

  const handleFilterProject = (value: string) => {
    setFilterProject(value);
    fetchKonsumenList(filterStatus, filterSource, filterBudget, value, 1, pagination.per_page, false, searchQuery, filterDateFrom, filterDateTo);
  };

  const handleFilterSource = (value: string) => {
    setFilterSource(value);
    setShowSourceModal(false);
    fetchKonsumenList(filterStatus, value, filterBudget, filterProject, 1, pagination.per_page, false, searchQuery, filterDateFrom, filterDateTo);
  };

  const getSourceLabel = () => {
    if (!filterSource) return 'Semua Sumber';
    const found = sourceOptions.find(s => s.value === filterSource);
    return found ? found.label : 'Semua Sumber';
  };

  // Fungsi untuk cek apakah ada filter aktif
  const hasActiveFilter = () => {
    return filterStatus !== '' || filterSource !== '' || filterBudget !== '' || filterDateFrom !== '' || filterDateTo !== '';
  };

  // Fungsi untuk reset semua filter
  const clearAllFilters = () => {
    setFilterStatus('');
    setFilterSource('');
    setFilterBudget('');
    setFilterProject('');
    setFilterDateFrom('');
    setFilterDateTo('');
    fetchKonsumenList('', '', '', '', 1, pagination.per_page, false, '', '', '');
  };

  const fetchKonsumenList = async (
    status = '',
    source = '',
    budget = '',
    project = '',
    page = 1,
    per_page = 10,
    append = false,
    search = '',
    date_from = '', // NEW
    date_to = ''    // NEW
  ) => {
    try {
      if (!append) {
        if (page === 1 && !search) {
          setLoading(true);
        } else {
          setSearching(true);
        }
      } else {
        setLoadingMore(true);
      }

      const response = await konsumenService.getKonsumenList({
        status,
        source,
        budget,
        project,
        page,
        per_page,
        search,
        date_from, // NEW
        date_to    // NEW
      });

      if (append) {
        setKonsumenList(prev => {
          const merged = [...prev, ...response.data];
          const unique = merged.filter(
            (item, index, self) =>
              index === self.findIndex(t => t.id === item.id)
          );
          return unique;
        });
      } else {
        setKonsumenList(response.data);
      }

      setPagination(response.meta);
    } catch (error) {
      console.error(error);
    } finally {
      if (!append) {
        setLoading(false);
        setSearching(false);
      }
      setLoadingMore(false);
    }
  };


  const handleLoadMore = () => {
    if (!pagination) return;
    if (loading || loadingMore) return;
    if (pagination.current_page >= pagination.last_page) return;

    fetchKonsumenList(
      filterStatus,
      filterSource,
      filterBudget,
      filterProject,
      pagination.current_page + 1,
      pagination.per_page,
      true,
      searchQuery,
      filterDateFrom,
      filterDateTo
    );
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleDateFromChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDateFromPicker(false);
    if (selectedDate) {
      setTempDateFrom(selectedDate);
      const formatted = formatLocalDate(selectedDate);
      setFilterDateFrom(formatted);
      fetchKonsumenList(filterStatus, filterSource, filterBudget, filterProject, 1, pagination.per_page, false, searchQuery, formatted, filterDateTo);
    }
  };

  const handleDateToChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDateToPicker(false);
    if (selectedDate) {
      setTempDateTo(selectedDate);
      const formatted = formatLocalDate(selectedDate);
      setFilterDateTo(formatted);
      fetchKonsumenList(filterStatus, filterSource, filterBudget, filterProject, 1, pagination.per_page, false, searchQuery, filterDateFrom, formatted);
    }
  };

  const clearDateFilter = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    fetchKonsumenList(filterStatus, filterSource, filterBudget, filterProject, 1, pagination.per_page, false, searchQuery, '', '');
  };


  const handleDelete = async (id: number) => {
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
              await konsumenService.deleteKonsumen(id);
              showSuccessToast 'Konsumen berhasil dihapus');
              fetchData();
            } catch (error: any) {
              showErrorToast(error.message);
            }
          },
        },
      ]
    );
  };

  
  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      {/* Filter Header */}
      <TouchableOpacity 
        style={styles.filterHeader}
        onPress={() => setFilterExpanded(!filterExpanded)}
      >
        <View style={styles.filterHeaderLeft}>
          <Text style={styles.filterHeaderText}>Filter</Text>
          {hasActiveFilter() && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {[filterStatus, filterSource, filterBudget, filterDateFrom, filterDateTo].filter(Boolean).length}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.filterHeaderRight}>
          {hasActiveFilter() && (
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearFilterText}>Reset</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.filterExpandIcon}>
            {filterExpanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Filter Content - hanya muncul kalau expanded */}
      {filterExpanded && (
        <>
          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status Lead</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {statusOptions.map((status, idx) => {
                const active = filterStatus === status.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleFilterStatus(status.value)}
                    style={[
                      styles.chip,
                      active && [styles.chipActive, { backgroundColor: status.color }]
                    ]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Source Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sumber Lead</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, filterSource && styles.dropdownButtonActive]}
              onPress={() => setShowSourceModal(true)}
            >
              <Text style={[styles.dropdownButtonText, filterSource && styles.dropdownButtonTextActive]}>
                {getSourceLabel()}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Budget Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Budget / Kesiapan Dana</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, filterBudget && styles.dropdownButtonActive]}
              onPress={() => setShowBudgetFilterModal(true)}
            >
              <Text style={[styles.dropdownButtonText, filterBudget && styles.dropdownButtonTextActive]}>
                {getBudgetLabel()}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
          
          {/* Project Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Bisnis / Project</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, filterProject && styles.dropdownButtonActive]}
              onPress={() => setShowProjectFilterModal(true)}
            >
              <Text style={[styles.dropdownButtonText, filterProject && styles.dropdownButtonTextActive]}>
                {getProjectLabel()}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Date Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Tanggal Ditambahkan</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.dropdownButton, { flex: 1 }, filterDateFrom && styles.dropdownButtonActive]}
                onPress={() => setShowDateFromPicker(true)}
              >
                <Text style={[styles.dropdownButtonText, filterDateFrom && styles.dropdownButtonTextActive]}>
                  {filterDateFrom
                    ? new Date(filterDateFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Dari tanggal'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownButton, { flex: 1 }, filterDateTo && styles.dropdownButtonActive]}
                onPress={() => setShowDateToPicker(true)}
              >
                <Text style={[styles.dropdownButtonText, filterDateTo && styles.dropdownButtonTextActive]}>
                  {filterDateTo
                    ? new Date(filterDateTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Sampai tanggal'}
                </Text>
              </TouchableOpacity>

              {(filterDateFrom || filterDateTo) && (
                <TouchableOpacity onPress={clearDateFilter} style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
                  <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {showDateFromPicker && (
              <DateTimePicker
                value={tempDateFrom}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateFromChange}
              />
            )}
            {showDateToPicker && (
              <DateTimePicker
                value={tempDateTo}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateToChange}
              />
            )}
          </View>
        </>
      )}
    </View>
  );

  // Render Source Modal
  const renderSourceModal = () => (
    <Modal
      visible={showSourceModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSourceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Sumber Lead</Text>
            <TouchableOpacity onPress={() => setShowSourceModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {sourceOptions.map((source, idx) => {
              const active = filterSource === source.value;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.sourceOption, active && styles.sourceOptionActive]}
                  onPress={() => handleFilterSource(source.value)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.sourceOptionText, active && styles.sourceOptionTextActive]}>
                    {source.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderBudgetModal = () => (
    <Modal visible={showBudgetFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModalContent}>
          <View style={styles.dropdownModalHeader}>
            <Text style={styles.dropdownModalTitle}>Filter Budget</Text>
            <TouchableOpacity onPress={() => setShowBudgetFilterModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dropdownList}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setFilterBudget('');
                setShowBudgetFilterModal(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Semua Budget</Text>
              {!filterBudget && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            {budgetOptions.map((budget) => (
              <TouchableOpacity
                key={budget.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterBudget(budget.value);
                  handleFilterBudget(budget.value);
                  setShowBudgetFilterModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{budget.label}</Text>
                {filterBudget === budget.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderProjectModal = () => (
    <Modal visible={showProjectFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModalContent}>
          <View style={styles.dropdownModalHeader}>
            <Text style={styles.dropdownModalTitle}>Filter Project</Text>
            <TouchableOpacity onPress={() => setShowProjectFilterModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.dropdownList}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setFilterProject('');
                setShowProjectFilterModal(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Semua Project</Text>
              {!filterProject && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            {mitras.map((mitra) => (
              <TouchableOpacity
                key={mitra.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setFilterProject(mitra.id);
                  handleFilterProject(mitra.id);
                  setShowProjectFilterModal(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{mitra.name}</Text>
                {filterProject === mitra.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && !searchQuery) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#312a7a" />
      </View>
    );
  }

  const getInitials = (name = '') => {
    if (!name) return 'U'; // default User

    const words = name.trim().split(' ');

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase(); // misal "Budi" → "BU"
    }

    // Ambil huruf pertama dari 2 kata pertama
    return (words[0][0] + words[1][0]).toUpperCase(); // "Budi Santoso" → "BS"
  };


  const renderItem = ({ item }: { item: Konsumen }) => (
    <TouchableOpacity
      style={newStyles.listCard}
      onPress={() => {
        setSelectedKonsumen(item);
        setShowDetailModal(true);
      }}
    >
      <View style={newStyles.avatarCircle}>
        <Text style={newStyles.avatarText}>
          {getInitials(item.name || 'User')}
        </Text>
      </View>
      <View style={newStyles.listContent}>
        <View style={newStyles.cardHeaderRow}>
          <Text style={newStyles.listTitle}>
            {item.name || 'User'} 
            <Text style={newStyles.locationText}>
              {' | '} {item.mitra.name}
            </Text>
          </Text>


          {/* Badge Status */}
          <View style={[
            newStyles.badge,
            item.latest_followup?.followup_status.name === "Hot" && newStyles.badgeHot,
            item.latest_followup?.followup_status.name === "Warm" && newStyles.badgeWarm,
            item.latest_followup?.followup_status.name === "Cold" && newStyles.badgeCold,
            item.latest_followup?.followup_status.name === "Cancel" && newStyles.badgeCancel,
            item.latest_followup?.followup_status.name === "Closing" && newStyles.badgeClosing,
          ]}>
            <Text style={newStyles.badgeText}>
              {item.latest_followup?.followup_status.name || 'Unknown'}
            </Text>
          </View>
        </View>

        <Text style={newStyles.listSubtitle}>
          {(() => {
            let sources = item.source;
            if (typeof sources === 'string') {
              try {
                sources = JSON.parse(sources);
              } catch {
                sources = [];
              }
            }
            return Array.isArray(sources)
              ? sources
                  .map(s => s.replace(/_/g, ' '))
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                  .join(', ')
              : '';
          })()}
        </Text>
        
        <Text style={newStyles.listSubtitle}>
          Budget : {(() => {
            const budget = item.budget;
            if (!budget) return '-';
            
            // Map budget value to label
            const budgetMap: { [key: string]: string } = {
              'below_500m': 'Kurang dari 500 jt',
              '500m_800m': '500 jt - 800 jt',
              '800m_1.2m': '800 jt - 1,2 M',
              '1.2m_3m': '1,2 M - 3 M',
              'above_3m': 'Lebih dari 3 M'
            };
            
            return budgetMap[budget] || budget;
          })()}
        </Text>

        <Text style={newStyles.listDate}>
          added to {new Date(item.created_at).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

      </View>
    </TouchableOpacity>
  );


  return (
    <View 
      style={styles.container}>
        
      <FlatList
        data={konsumenList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}

        // Pull to refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }

        // Infinite scroll
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}

        // 👇 Semua UI statis taruh sini
        ListHeaderComponent={
          <>
            {/* HEADER + Statistik */}
            <View style={newStyles.header}>
              <View style={newStyles.headerRow}>
                {!showSearch ? (
                  <>
                    <Text style={newStyles.headerTitle}>Konsumen</Text>
                    <TouchableOpacity onPress={() => setShowSearch(true)}>
                      <SearchIcon size={20} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={newStyles.searchBarHeader}>
                    <TextInput
                      style={newStyles.searchInputHeader}
                      placeholder="Cari konsumen..."
                      placeholderTextColor="#c4c4c4"
                      value={searchQuery}
                      onChangeText={handleSearch}
                      autoFocus
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      
                      {/* 🔥 LOADING KECIL */}
                      {searching && (
                        <ActivityIndicator size="small" color="#fff" />
                      )}

                      {/* ❌ CLEAR BUTTON */}
                      <TouchableOpacity
                        onPress={() => {
                          setShowSearch(false);
                          setSearchQuery('');

                          fetchKonsumenList(
                            filterStatus,
                            filterSource,
                            filterBudget,
                            filterProject,
                            1,
                            pagination.per_page,
                            false,
                            ''
                          );
                        }}
                      >
                        <CloseIcon size={20} color="#fff" />
                      </TouchableOpacity>

                    </View>
                  </View>
                )}
              </View>

              {!showSearch && (
                <Text style={newStyles.headerSubtitle}>
                  Kelola data konsumen Anda
                </Text>
              )}

              {statistics && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={newStyles.statsScroll}
                >
                  <View style={newStyles.statCardPrimary}>
                    <Text style={newStyles.statValue}>{statistics.total || 0}</Text>
                    <Text style={newStyles.statLabel}>Total</Text>
                  </View>

                  {(statistics.by_status ?? []).map((item, index) => (
                    <View key={index} style={newStyles.statCard}>
                      <Text style={newStyles.statValue}>{item.total || 0}</Text>
                      <Text style={newStyles.statLabel}>{item.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {renderFilterSection()}
            {renderSourceModal()}
            {renderBudgetModal()}
            {renderProjectModal()}
          </>
        }

        ListEmptyComponent={
          !loading ? (
            <View style={newStyles.emptyState}>
              <Text style={newStyles.emptyStateTitle}>Tidak Ada Data</Text>
              <Text style={newStyles.emptyStateText}>
                {searchQuery 
                  ? 'Tidak ada konsumen yang sesuai dengan pencarian'
                  : hasActiveFilter()
                  ? 'Tidak ada konsumen yang sesuai dengan filter'
                  : 'Belum ada data konsumen. Tambahkan konsumen baru untuk memulai.'}
              </Text>
            </View>
          ) : null
        }

        // Footer loading untuk infinite scroll
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
      />

      
      {/* Modals */}
      <AddKonsumenModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchData();
        }}
      />

      <EditKonsumenModal
        visible={showEditModal}
        konsumen={selectedKonsumen}
        onClose={() => {
          setShowEditModal(false);
          setSelectedKonsumen(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedKonsumen(null);
          fetchData();
        }}
      />

      <DetailKonsumenModal
        visible={showDetailModal}
        konsumen={selectedKonsumen}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedKonsumen(null);
        }}
        onEdit={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
        onDelete={() => {
          if (selectedKonsumen) {
            setShowDetailModal(false);
            handleDelete(selectedKonsumen.id);
            setSelectedKonsumen(null);
          }
        }}
        onRefresh={fetchData}
      />

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Add Konsumen Modal
const AddKonsumenModal = ({ visible, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    province: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    source: [] as string[],
    budget: '',
    mitra_id: '', // NEW: Mitra selection
  });

  const [saving, setSaving] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showMitraModal, setShowMitraModal] = useState(false); // NEW: Mitra modal
  const [mitras, setMitras] = useState<any[]>([]); // NEW: List mitras
  const [loadingMitras, setLoadingMitras] = useState(false); // NEW: Loading state

  const provinces = Object.keys(locationData);
  const cities = formData.province ? locationData[formData.province as keyof typeof locationData] || [] : [];

  // NEW: Fetch mitras when modal opens
  useEffect(() => {
    if (visible) {
      fetchMitras();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setFormData({
        name: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        province: '',
        facebook: '',
        instagram: '',
        tiktok: '',
        source: [] as string[],
        budget: '',
        mitra_id: '',
      });
    }
  }, [visible]);

  // NEW: Fetch mitras from API
  const fetchMitras = async () => {
    try {
      setLoadingMitras(true);
      const userData = await authService.getUser();
      if (!userData) {
        showErrorToast('Gagal mendapatkan data bisnis / project');
        setLoadingMitras(false);
        return;
      }
      const data = await konsumenService.getMitras(userData.id.toString());
      setMitras(data);
      
      // Auto-select first mitra if only one
      if (data.length === 1) {
        setFormData(prev => ({ ...prev, mitra_id: data[0].id.toString() }));
      }
    } catch (error: any) {
      showErrorToast('Gagal memuat daftar mitra');
    } finally {
      setLoadingMitras(false);
    }
  };

  // Validasi: minimal salah satu kontak harus diisi
  const validateContactInfo = () => {
    const hasContact = 
      formData.whatsapp.trim() !== '' ||
      formData.email.trim() !== '' ||
      formData.address.trim() !== '' ||
      formData.facebook.trim() !== '' ||
      formData.instagram.trim() !== '' ||
      formData.tiktok.trim() !== '';

    return hasContact;
  };

  const handleSave = async () => {
    // NEW: Validasi mitra
    if (!formData.mitra_id) {
      showErrorToast('Pilih mitra/bisnis terlebih dahulu');
      return;
    }

    // Validasi kontak
    if (!validateContactInfo()) {
      Alert.alert(
        'Error', 
        'Minimal salah satu kontak harus diisi (WhatsApp, Email, Alamat, atau Social Media)'
      );
      return;
    }

    // Validasi source
    if (!Array.isArray(formData.source) || formData.source.length === 0) {
      showErrorToast('Sumber konsumen harus dipilih');
      return;
    }

    try {
      setSaving(true);
      await konsumenService.createKonsumen(formData); // Will include mitra_id
      showSuccessToast 'Konsumen berhasil ditambahkan');
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSource = (value: string) => {
    setFormData(prev => {
      const currentSources = Array.isArray(prev.source) ? prev.source : [];

      const newSources = currentSources.includes(value)
        ? currentSources.filter(s => s !== value)
        : [...currentSources, value];

      return { ...prev, source: newSources };
    });
  };

  // NEW: Get selected mitra name
  const getSelectedMitraName = () => {
    if (!formData.mitra_id) return null;
    const mitra = mitras.find(m => m.id.toString() === formData.mitra_id);
    return mitra ? mitra.name : null;
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
            {/* NEW: Mitra Selection Section */}
            <View style={[styles.section]}>
              <Text style={styles.sectionTitle}>Pilih Bisnis / Project *</Text>
              
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowMitraModal(true)}
                  disabled={loadingMitras}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.mitra_id && styles.dropdownPlaceholder
                  ]}>
                    {loadingMitras 
                      ? 'Memuat...' 
                      : (getSelectedMitraName() || 'Pilih bisnis/project')
                    }
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Basic Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama (Opsional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Masukkan nama konsumen"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Provinsi</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowProvinceModal(true)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.province && styles.dropdownPlaceholder
                  ]}>
                    {formData.province || 'Pilih provinsi'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kota</Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    !formData.province && styles.dropdownButtonDisabled
                  ]}
                  onPress={() => formData.province && setShowCityModal(true)}
                  disabled={!formData.province}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.city && styles.dropdownPlaceholder
                  ]}>
                    {formData.city || (formData.province ? 'Pilih kota' : 'Pilih provinsi terlebih dahulu')}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Budget Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget / Kesiapan Dana</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowBudgetModal(true)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.budget && styles.dropdownPlaceholder
                  ]}>
                    {formData.budget ? budgetOptions.find(b => b.value === formData.budget)?.label : 'Pilih budget'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Info Section */}
            <View style={[styles.section, styles.contactSection]}>
              <Text style={styles.sectionTitle}>Informasi Kontak</Text>
              <Text style={styles.sectionSubtitle}>
                * Minimal salah satu harus diisi
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WhatsApp</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.phonePrefix}>+62</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={formData.whatsapp}
                    onChangeText={(text) => {
                      let cleaned = text.replace(/\D/g, ''); // buang non-angka
                      if (cleaned.startsWith('0')) {
                        cleaned = cleaned.slice(1);
                      }
                      if (cleaned.startsWith('62')) {
                        cleaned = cleaned.slice(2);
                      }
                      setFormData({ ...formData, whatsapp: cleaned });
                    }}
                    placeholder="85xxxxxxxxxx"
                    placeholderTextColor="#6b7280"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="email@example.com"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Alamat lengkap"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Social Media Section */}
              <View style={styles.socialMediaGroup}>
                <Text style={styles.inputLabel}>Social Media</Text>
                
                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.facebook}
                    onChangeText={(text) => setFormData({ ...formData, facebook: text })}
                    placeholder="Facebook URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.instagram}
                    onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                    placeholder="Instagram URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.tiktok}
                    onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
                    placeholder="TikTok URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Source Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sumber Konsumen *</Text>
              <Text style={styles.sectionSubtitle}>Pilih minimal 1 sumber</Text>
              
              <View style={styles.sourceGrid}>
                {sourceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sourceButton,
                      formData.source.includes(option.value) && styles.sourceButtonActive
                    ]}
                    onPress={() => toggleSource(option.value)}
                  >
                    <Text style={[
                      styles.sourceButtonText,
                      formData.source.includes(option.value) && styles.sourceButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                    {formData.source.includes(option.value) && (
                      <Text style={styles.sourceCheckmark}> ✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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

      {/* NEW: Mitra Modal */}
      <Modal visible={showMitraModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Mitra / Bisnis</Text>
              <TouchableOpacity onPress={() => setShowMitraModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {mitras.map((mitra) => (
                <TouchableOpacity
                  key={mitra.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, mitra_id: mitra.id.toString() });
                    setShowMitraModal(false);
                  }}
                >
                  <View>
                    <Text style={styles.dropdownItemText}>{mitra.name}</Text>
                    {mitra.company_name && (
                      <Text style={styles.dropdownItemSubtext}>{mitra.company_name}</Text>
                    )}
                  </View>
                  {formData.mitra_id === mitra.id.toString() && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Province Modal */}
      <Modal visible={showProvinceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Provinsi</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, province, city: '' });
                    setShowProvinceModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{province}</Text>
                  {formData.province === province && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Kota</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, city });
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                  {formData.city === city && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Budget / Kesiapan Dana</Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {budgetOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, budget: option.value });
                    setShowBudgetModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                  {formData.budget === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Edit Konsumen Modal  
const EditKonsumenModal = ({ visible, konsumen, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    province: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    source: [] as string[],
    budget: '',
    mitra_id: '', // NEW: Mitra selection
  });

  const [saving, setSaving] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showMitraModal, setShowMitraModal] = useState(false); // NEW: Mitra modal
  const [mitras, setMitras] = useState<any[]>([]); // NEW: List mitras
  const [loadingMitras, setLoadingMitras] = useState(false); // NEW: Loading state

  const provinces = Object.keys(locationData);
  const cities = formData.province ? locationData[formData.province as keyof typeof locationData] || [] : [];

  // NEW: Fetch mitras when modal opens
  useEffect(() => {
    if (visible) {
      fetchMitras();
    }
  }, [visible]);

  useEffect(() => {
    if (konsumen) {
      setFormData({
        name: konsumen.name || '',
        whatsapp: konsumen.whatsapp || '',
        email: konsumen.email || '',
        address: konsumen.address || '',
        city: konsumen.city || '',
        province: konsumen.province || '',
        facebook: konsumen.facebook || '',
        instagram: konsumen.instagram || '',
        tiktok: konsumen.tiktok || '',
        budget: konsumen.budget || '',
        mitra_id: konsumen.mitra_id ? konsumen.mitra_id.toString() : '', // NEW: Load mitra
        source: (() => {
          if (!konsumen.source) return [];
          if (Array.isArray(konsumen.source)) return konsumen.source;
          try {
            return JSON.parse(konsumen.source);
          } catch {
            return [];
          }
        })(),
      });
    }
  }, [konsumen]);

  // NEW: Fetch mitras from API
  const fetchMitras = async () => {
    try {
      setLoadingMitras(true);
      const userData = await authService.getUser();
      if (!userData) {
        showErrorToast('Gagal mendapatkan data bisnis / project');
        setLoadingMitras(false);
        return;
      }
      const data = await konsumenService.getMitras(userData.id.toString());
      setMitras(data);
    } catch (error: any) {
      showErrorToast('Gagal memuat daftar mitra');
    } finally {
      setLoadingMitras(false);
    }
  };
  
  const toggleSource = (value: string) => {
    setFormData(prev => {
      const currentSources = Array.isArray(prev.source) ? prev.source : [];

      const newSources = currentSources.includes(value)
        ? currentSources.filter(s => s !== value)
        : [...currentSources, value];

      return { ...prev, source: newSources };
    });
  };

  // Validasi: minimal salah satu dari kontak harus diisi
  const validateContactInfo = () => {
    const hasContact = 
      formData.whatsapp.trim() !== '' ||
      formData.email.trim() !== '' ||
      formData.address.trim() !== '' ||
      formData.facebook.trim() !== '' ||
      formData.instagram.trim() !== '' ||
      formData.tiktok.trim() !== '';

    return hasContact;
  };

  const handleSave = async () => {
    // NEW: Validasi mitra
    if (!formData.mitra_id) {
      showErrorToast('Pilih mitra/bisnis terlebih dahulu');
      return;
    }

    // Validasi kontak
    if (!validateContactInfo()) {
      Alert.alert(
        'Error', 
        'Minimal salah satu kontak harus diisi (WhatsApp, Email, Alamat, atau Social Media)'
      );
      return;
    }

    // Validasi source
    if (!Array.isArray(formData.source) || formData.source.length === 0) {
      showErrorToast('Sumber konsumen harus dipilih');
      return;
    }

    try {
      setSaving(true);
      await konsumenService.updateKonsumen(konsumen.id, formData); // Will include mitra_id
      showSuccessToast 'Konsumen berhasil diupdate');
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  // NEW: Get selected mitra name
  const getSelectedMitraName = () => {
    if (!formData.mitra_id) return null;
    const mitra = mitras.find(m => m.id.toString() === formData.mitra_id);
    return mitra ? mitra.name : null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Konsumen</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* NEW: Mitra Selection Section */}
            <View style={[styles.section]}>
              <Text style={styles.sectionTitle}>Pilih Bisnis / Project *</Text>
              
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowMitraModal(true)}
                  disabled={loadingMitras}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.mitra_id && styles.dropdownPlaceholder
                  ]}>
                    {loadingMitras 
                      ? 'Memuat...' 
                      : (getSelectedMitraName() || 'Pilih bisnis/project')
                    }
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Basic Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama (Opsional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Masukkan nama konsumen"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Provinsi</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowProvinceModal(true)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.province && styles.dropdownPlaceholder
                  ]}>
                    {formData.province || 'Pilih provinsi'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kota</Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    !formData.province && styles.dropdownButtonDisabled
                  ]}
                  onPress={() => formData.province && setShowCityModal(true)}
                  disabled={!formData.province}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.city && styles.dropdownPlaceholder
                  ]}>
                    {formData.city || (formData.province ? 'Pilih kota' : 'Pilih provinsi terlebih dahulu')}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Budget Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget / Kesiapan Dana</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowBudgetModal(true)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !formData.budget && styles.dropdownPlaceholder
                  ]}>
                    {formData.budget ? budgetOptions.find(b => b.value === formData.budget)?.label : 'Pilih budget'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Info Section */}
            <View style={[styles.section, styles.contactSection]}>
              <Text style={styles.sectionTitle}>Informasi Kontak</Text>
              <Text style={styles.sectionSubtitle}>
                * Minimal salah satu harus diisi
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WhatsApp</Text>
                <TextInput
                  style={styles.input}
                  value={formData.whatsapp}
                  onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                  placeholder="08xxxxxxxxxx"
                  placeholderTextColor="#6b7280"
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
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Alamat lengkap"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Social Media Section */}
              <View style={styles.socialMediaGroup}>
                <Text style={styles.inputLabel}>Social Media</Text>
                
                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.facebook}
                    onChangeText={(text) => setFormData({ ...formData, facebook: text })}
                    placeholder="Facebook URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.instagram}
                    onChangeText={(text) => setFormData({ ...formData, instagram: text })}
                    placeholder="Instagram URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.socialMediaItem}>
                  <TextInput
                    style={[styles.input, styles.socialMediaInput]}
                    value={formData.tiktok}
                    onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
                    placeholder="TikTok URL"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Source Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sumber Konsumen *</Text>
              <Text style={styles.sectionSubtitle}>Pilih minimal 1 sumber</Text>
              
              <View style={styles.sourceGrid}>
                {sourceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sourceButton,
                      formData.source.includes(option.value) && styles.sourceButtonActive
                    ]}
                    onPress={() => toggleSource(option.value)}
                  >
                    <Text style={[
                      styles.sourceButtonText,
                      formData.source.includes(option.value) && styles.sourceButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                    {formData.source.includes(option.value) && (
                      <Text style={styles.sourceCheckmark}> ✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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

      {/* NEW: Mitra Modal */}
      <Modal visible={showMitraModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Mitra / Bisnis</Text>
              <TouchableOpacity onPress={() => setShowMitraModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {mitras.map((mitra) => (
                <TouchableOpacity
                  key={mitra.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, mitra_id: mitra.id.toString() });
                    setShowMitraModal(false);
                  }}
                >
                  <View>
                    <Text style={styles.dropdownItemText}>{mitra.name}</Text>
                    {mitra.company_name && (
                      <Text style={styles.dropdownItemSubtext}>{mitra.company_name}</Text>
                    )}
                  </View>
                  {formData.mitra_id === mitra.id.toString() && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Province Modal */}
      <Modal visible={showProvinceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Provinsi</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, province, city: '' });
                    setShowProvinceModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{province}</Text>
                  {formData.province === province && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Kota</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, city });
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                  {formData.city === city && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Pilih Budget / Kesiapan Dana</Text>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {budgetOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, budget: option.value });
                    setShowBudgetModal(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option.label}</Text>
                  {formData.budget === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const DetailKonsumenModal = ({ visible, konsumen, onClose, onEdit, onDelete, onRefresh }: any) => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [showEditFollowup, setShowEditFollowup] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);
  const [expandedFollowups, setExpandedFollowups] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (konsumen && visible) {
      fetchFollowups();
    }
  }, [konsumen, visible]);

  const fetchFollowups = async () => {
    if (!konsumen) return;
    
    try {
      setLoadingFollowups(true);
      const data = await followupService.getFollowupList({ konsumen_id: konsumen.id });
      setFollowups(data);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoadingFollowups(false);
    }
  };

  const toggleFollowup = (id: string) => {
    setExpandedFollowups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  if (!konsumen) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={stylesDetail.modalOverlay}>
        <View style={stylesDetail.modalContent}>
          <View style={stylesDetail.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={stylesDetail.modalTitle}>{konsumen.name || 'Konsumen Tanpa Nama'}</Text>
              <Text style={stylesDetail.detailCode}>{konsumen.code}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={stylesDetail.modalBody}>
            {/* Contact Info */}
            {(konsumen.whatsapp || konsumen.email || konsumen.address || konsumen.city || konsumen.province) && (
              <View style={stylesDetail.detailSection}>
                <Text style={stylesDetail.sectionTitle}>Informasi Kontak</Text>
                
                {konsumen.whatsapp && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>WhatsApp</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.whatsapp}</Text>
                  </View>
                )}
                {konsumen.email && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Email</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.email}</Text>
                  </View>
                )}
                {konsumen.address && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Alamat</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.address}</Text>
                  </View>
                )}
                {konsumen.city && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Kota</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.city}</Text>
                  </View>
                )}
                {konsumen.province && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Provinsi</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.province}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Social Media */}
            {(konsumen.facebook || konsumen.instagram || konsumen.tiktok) && (
              <View style={stylesDetail.detailSection}>
                <Text style={stylesDetail.sectionTitle}>Social Media</Text>
                
                {konsumen.facebook && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Facebook</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.facebook}</Text>
                  </View>
                )}
                {konsumen.instagram && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>Instagram</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.instagram}</Text>
                  </View>
                )}
                {konsumen.tiktok && (
                  <View style={stylesDetail.detailRow}>
                    <Text style={stylesDetail.detailLabel}>TikTok</Text>
                    <Text style={stylesDetail.detailValue}>{konsumen.tiktok}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Source */}
            { konsumen.source && (
              <View style={stylesDetail.detailSection}>
                <Text style={stylesDetail.sectionTitle}>Sumber</Text>
                <View style={stylesDetail.detailRow}>
                  <Text style={stylesDetail.detailValue}>
                    {(() => {
                      let list = konsumen.source;

                      // Jika masih string JSON → convert
                      if (typeof list === 'string') {
                        try {
                          list = JSON.parse(list);
                        } catch {
                          list = [];
                        }
                      }

                      // Jika sudah array → formatting
                      return Array.isArray(list)
                        ? list
                            .map(item =>
                              item
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c: string) => c.toUpperCase())
                            )
                            .join(', ')
                        : '-';
                    })()}
                  </Text>
                </View>
              </View>
            )}
            
            { konsumen.budget && (
              <View style={stylesDetail.detailSection}>
                <Text style={stylesDetail.sectionTitle}>Budget / Kesiapan Dana</Text>
                <View style={stylesDetail.detailRow}>
                  <Text style={stylesDetail.detailValue}>
                    {(() => {
                        const budget = konsumen.budget;
                        if (!budget) return '-';
                        
                        // Map budget value to label
                        const budgetMap: { [key: string]: string } = {
                          'below_500m': 'Kurang dari 500 jt',
                          '500m_800m': '500 jt - 800 jt',
                          '800m_1.2m': '800 jt - 1,2 M',
                          '1.2m_3m': '1,2 M - 3 M',
                          'above_3m': 'Lebih dari 3 M'
                        };
                        
                        return budgetMap[budget] || budget;
                      })()}
                  </Text>
                </View>
              </View>
            )}



            {/* Notes */}
            {konsumen.notes && (
              <View style={stylesDetail.detailSection}>
                <Text style={stylesDetail.sectionTitle}>Catatan</Text>
                <Text style={stylesDetail.detailValue}>{konsumen.notes}</Text>
              </View>
            )}

            {/* Followup History */}
            <View style={stylesDetail.detailSection}>
              <View style={stylesDetail.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={stylesDetail.sectionTitle}>Riwayat Follow Up</Text>
                  <View style={stylesDetail.followupCountBadge}>
                    <Text style={stylesDetail.followupCountText}>{followups.length}</Text>
                  </View>
                </View>
              </View>

              {loadingFollowups ? (
                <ActivityIndicator color="#312a7a" style={{ marginTop: 16 }} />
              ) : followups.length === 0 ? (
                <View style={stylesDetail.emptyFollowup}>
                  <Text style={stylesDetail.emptyFollowupText}>Belum ada riwayat follow up</Text>
                </View>
              ) : (
                <View style={stylesDetail.followupList}>
                  {followups.map((followup) => {
                    const isExpanded = expandedFollowups[followup.id];
                    return (
                      <View key={followup.id} style={stylesDetail.followupCard}>
                        <TouchableOpacity 
                          style={stylesDetail.followupHeader}
                          onPress={() => toggleFollowup(followup.id.toString())}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={stylesDetail.followupType}>
                              {getFollowupTypeLabel(followup.type)}
                            </Text>
                            <Text style={stylesDetail.followupDate}>
                              {new Date(followup.followup_date).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            {followup.followup_status?.name && (
                              <View style={stylesDetail.followupStatusBadge}>
                                <Text style={stylesDetail.followupStatusText}>
                                  {followup.followup_status.name}
                                </Text>
                              </View>
                            )}
                            <Text style={stylesDetail.arrowIcon}>
                              {isExpanded ? '▼' : '▶'}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={stylesDetail.followupContent}>
                            <Text style={stylesDetail.followupNotes}>Keterangan Follow Up : {followup.notes}</Text>

                            {/* {followup.response && (
                              <View style={stylesDetail.followupResponse}>
                                <Text style={stylesDetail.followupResponseLabel}>Respon:</Text>
                                <Text style={stylesDetail.followupResponseText}>{followup.response}</Text>
                              </View>
                            )} */}
                            
                            {followup.result && (
                              <View style={stylesDetail.followupResponse}>
                                <Text style={stylesDetail.followupResponseLabel}>Respon :</Text>
                                <Text style={stylesDetail.followupResponseText}>{followup.result}</Text>
                              </View>
                            )}

                            {followup.next_followup_date && (
                              <Text style={stylesDetail.followupNext}>
                                Followup Selanjutnya : {new Date(followup.next_followup_date).toLocaleString('id-ID', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </Text>
                            )}
                            {followup.visit_date && (
                              <Text style={stylesDetail.followupNext}>
                                Cek Lokasi : {new Date(followup.visit_date).toLocaleString('id-ID', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </Text>
                            )}

                            <TouchableOpacity
                              style={stylesDetail.followupEditBtn}
                              onPress={() => {
                                setSelectedFollowup(followup);
                                setShowEditFollowup(true);
                              }}
                            >
                              <Text style={stylesDetail.followupEditText}>Edit</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={stylesDetail.modalFooter}>
            <TouchableOpacity 
              style={[stylesDetail.button, stylesDetail.buttonSecondary]}
              onPress={() => setShowAddFollowup(true)}
            >
              <Text style={stylesDetail.buttonSecondaryText}>+ Follow Up</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[stylesDetail.button, stylesDetail.buttonPrimary]}
              onPress={onEdit}
            >
              <Text style={stylesDetail.buttonPrimaryText}>Edit Konsumen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Add Followup Modal */}
      <AddFollowupModal
        visible={showAddFollowup}
        konsumenId={konsumen.id}
        onClose={() => setShowAddFollowup(false)}
        onSuccess={() => {
          setShowAddFollowup(false);
          fetchFollowups();
          onRefresh();
        }}
      />

      {/* Edit Followup Modal */}
      <EditFollowupModal
        visible={showEditFollowup}
        followup={selectedFollowup}
        onClose={() => {
          setShowEditFollowup(false);
          setSelectedFollowup(null);
        }}
        onSuccess={() => {
          setShowEditFollowup(false);
          setSelectedFollowup(null);
          fetchFollowups();
          onRefresh();
        }}
      />
    </Modal>
  );
};

const stylesDetail = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  detailCode: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  editIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: '#312a7a',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: '#312a7a',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addFollowupButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#312a7a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFollowupIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  followupCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  followupCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  followupCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  followupContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  followupType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  followupDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  followupStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  followupStatusText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '500',
  },
  followupNotes: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 18,
  },
  followupResponse: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupResponseLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 3,
  },
  followupResponseText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  followupNext: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  followupEditIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followupEditIcon: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  followupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  followupEditBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followupEditText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyFollowup: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyFollowupText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  followupList: {
    gap: 10,
  },
});

// Add Followup Modal - UPDATED
const AddFollowupModal = ({ visible, konsumenId, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState<CreateFollowupData>({
    konsumen_id: konsumenId,
    type: 'whatsapp',
    notes: '',
    response: '',
    next_followup_date: '',
    result: '', // Akan diubah menjadi string yang digabung dengan koma
    status: 'Warm',
    visit_date: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
  // ADDED: State untuk visit date picker
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showVisitTimePicker, setShowVisitTimePicker] = useState(false);
  const [tempVisitDate, setTempVisitDate] = useState(new Date());
  
  const [konsumenData, setKonsumenData] = useState<any>(null);
  const [loadingKonsumen, setLoadingKonsumen] = useState(false);
  
  // Data dari API
  const [konsumenResponses, setKonsumenResponses] = useState<any[]>([]);
  const [followupNotes, setFollowupNotes] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // State baru untuk multiple choice response
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const [editableContact, setEditableContact] = useState({
    whatsapp: '',
    email: '',
    address: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  // ADDED: Helper untuk cek apakah perlu menampilkan visit_date
  const shouldShowVisitDate = () => {
    return selectedResponses.some(response => 
      response.toLowerCase().includes('mau cek lokasi') || 
      response.toLowerCase().includes('jadwal cek lokasi')
    );
  };

  // FETCH KONSUMEN DATA
  useEffect(() => {
    if (visible && konsumenId) {
      fetchKonsumenData();
    }
  }, [visible, konsumenId]);

  const fetchKonsumenData = async () => {
    try {
      setLoadingKonsumen(true);
      const data = await konsumenService.getKonsumenById(konsumenId);
      setKonsumenData(data);
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

  // UPDATE KONSUMEN CONTACT
  const updateKonsumenContact = async () => {
    try {
      await konsumenService.updateKonsumen(konsumenId, editableContact);
    } catch (error) {
      console.error('Error updating konsumen contact:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOptions();
      setFormData({
        konsumen_id: konsumenId,
        type: 'whatsapp',
        followup_date: new Date().toISOString().slice(0, 16),
        notes: '',
        response: '',
        next_followup_date: '',
        result: '',
        status: 'Warm',
        visit_date: '', // ADDED: Reset visit_date
      });
      setSelectedResponses([]); // Reset selected responses
      setTempDate(new Date());
      setTempVisitDate(new Date()); // ADDED: Reset temp visit date
    }
  }, [visible, konsumenId]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [responses, notes] = await Promise.all([
        konsumenService.getKonsumenResponses(),
        konsumenService.getFollowupNotes()
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

  // Handler untuk toggle response (multiple choice)
  const toggleResponse = (responseName: string) => {
    let newSelectedResponses: string[];
    
    if (selectedResponses.includes(responseName)) {
      // Jika sudah dipilih, hapus dari array
      newSelectedResponses = selectedResponses.filter(r => r !== responseName);
    } else {
      // Jika belum dipilih, tambahkan ke array
      newSelectedResponses = [...selectedResponses, responseName];
    }
    
    setSelectedResponses(newSelectedResponses);
    
    // Update formData.result dengan string yang digabung dengan koma
    const updatedFormData = { 
      ...formData, 
      result: newSelectedResponses.join(', ') 
    };
    
    // ADDED: Reset visit_date jika tidak ada lagi response yang memerlukan visit_date
    const needsVisitDate = newSelectedResponses.some(response => 
      response.toLowerCase().includes('mau cek lokasi') || 
      response.toLowerCase().includes('jadwal cek lokasi')
    );
    
    if (!needsVisitDate) {
      updatedFormData.visit_date = '';
    }
    
    setFormData(updatedFormData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      // Format manual - waktu lokal (tanpa UTC shift)
      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;

      setFormData({ ...formData, next_followup_date: formatted });
    }

    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };


  // ADDED: Handler untuk visit date
  const handleVisitDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowVisitDatePicker(false);
    }
    
    if (selectedDate) {
      setTempVisitDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowVisitTimePicker(true);
      }
    }
  };

  // ADDED: Handler untuk visit time
  const handleVisitTimeChange = (event: any, selectedTime?: Date) => {
    setShowVisitTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempVisitDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      // Format manual agar TIDAK pindah ke UTC
      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;

      setFormData({ ...formData, visit_date: formatted });
    }

    if (Platform.OS === 'ios') {
      setShowVisitDatePicker(false);
    }
  };


  // ADDED: Clear visit date
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

    // Validasi response hanya jika "Berhasil terhubung" dipilih
    if (formData.notes === 'Berhasil terhubung' && selectedResponses.length === 0) {
      showErrorToast('Response konsumen harus dipilih minimal 1');
      return;
    }

    // ADDED: Validasi visit_date jika response mengandung "mau cek lokasi"
    if (shouldShowVisitDate() && !formData.visit_date) {
      showErrorToast('Jadwal cek lokasi harus diisi');
      return;
    }

    try {
      setSaving(true);
      await updateKonsumenContact();
      await followupService.createFollowup(formData);
      showSuccessToast 'Follow up berhasil ditambahkan');
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Cold': '#6b7280',
      'Warm': '#f59e0b',
      'Hot': '#ef4444',
      'Cancel': '#374151',
      'Closing': '#10b981',
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
            <TextInput
              style={styles.input}
              value={editableContact.whatsapp}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, whatsapp: text })
              }
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
            />
            <Text style={styles.inputHint}>
              Nomor ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      case 'email':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Konsumen</Text>
            <TextInput
              style={styles.input}
              value={editableContact.email}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, email: text })
              }
              placeholder="email@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>
              Email ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      case 'visit':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat Konsumen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editableContact.address}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, address: text })
              }
              placeholder="Alamat lengkap"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.inputHint}>
              Alamat ini akan tersimpan ke data konsumen
            </Text>
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
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, facebook: text })
                }
                placeholder="Facebook URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.instagram}
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, instagram: text })
                }
                placeholder="Instagram URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.tiktok}
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, tiktok: text })
                }
                placeholder="TikTok URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>
            
            <Text style={styles.inputHint}>
              Social media ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tambah Follow Up</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Tipe Follow Up */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipe Follow Up *</Text>
              <View style={styles.typeGrid}>
                {[
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'email', label: 'Email' },
                  { value: 'visit', label: 'Kunjungan' },
                  { value: 'socmed', label: 'Socmed' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOptionNew,
                      formData.type === type.value && styles.typeOptionNewActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.value as any })}
                  >
                    <Text style={[
                      styles.typeOptionNewText,
                      formData.type === type.value && styles.typeOptionNewTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderContactField()}

            {/* Keterangan Followup - Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan Followup *</Text>
              {loadingOptions ? (
                <ActivityIndicator size="small" color="#312a7a" />
              ) : (
                <View style={styles.dropdownContainer}>
                  {followupNotes.map((note) => (
                    <TouchableOpacity
                      key={note.id}
                      style={[
                        styles.dropdownOption,
                        formData.notes === note.name && styles.dropdownOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, notes: note.name })}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        formData.notes === note.name && styles.dropdownOptionTextActive
                      ]}>
                        {note.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Response Konsumen - Multiple Choice - Hanya muncul jika "Berhasil terhubung" */}
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
                            isSelected && styles.dropdownOptionActive
                          ]}
                          onPress={() => toggleResponse(response.name)}
                        >
                          <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxActive
                          ]}>
                            {isSelected && (
                              <Text style={styles.checkboxIcon}>✓</Text>
                            )}
                          </View>
                          <Text style={[
                            styles.dropdownOptionText,
                            isSelected && styles.dropdownOptionTextActive
                          ]}>
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
                    <Text style={styles.selectedResponsesText}>
                      {selectedResponses.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ADDED: Jadwal Cek Lokasi - Hanya muncul jika response mengandung "mau cek lokasi" */}
            {shouldShowVisitDate() && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jadwal Cek Lokasi *</Text>
                
                {formData.visit_date ? (
                  <View style={styles.dateTimeDisplay}>
                    <Text style={styles.dateTimeText}>
                      {new Date(formData.visit_date.replace(' ', 'T')).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearDateBtn}
                      onPress={clearVisitDate}
                    >
                      <Text style={styles.clearDateText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowVisitDatePicker(true)}
                >
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

            {/* Status Lead */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status Lead *</Text>
              <View style={styles.statusGrid}>
                {['Cold', 'Warm', 'Hot', 'Cancel', 'Closing'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && [
                        styles.statusOptionActive,
                        { backgroundColor: getStatusColor(status) }
                      ]
                    ]}
                    onPress={() => setFormData({ ...formData, status: status as any })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      formData.status === status && styles.statusOptionTextActive
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Follow Up Berikutnya */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Follow Up Berikutnya</Text>
              
              {formData.next_followup_date ? (
                <View style={styles.dateTimeDisplay}>
                  <Text style={styles.dateTimeText}>
                    {new Date(formData.next_followup_date.replace(' ', 'T')).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearDateBtn}
                    onPress={clearNextFollowup}
                  >
                    <Text style={styles.clearDateText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
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

const EditFollowupModal = ({ visible, followup, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    type: 'whatsapp' as 'whatsapp' | 'email' | 'visit' | 'socmed',
    notes: '',
    response: '',
    next_followup_date: '',
    result: '',
    status: 'Warm' as 'Cold' | 'Warm' | 'Hot' | 'Cancel' | 'Closing',
    visit_date: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showVisitTimePicker, setShowVisitTimePicker] = useState(false);
  const [tempVisitDate, setTempVisitDate] = useState(new Date());
  
  const [konsumenResponses, setKonsumenResponses] = useState<any[]>([]);
  const [followupNotes, setFollowupNotes] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const [editableContact, setEditableContact] = useState({
    whatsapp: '',
    email: '',
    address: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  const [loadingKonsumen, setLoadingKonsumen] = useState(false);

  // Helper untuk cek apakah perlu menampilkan visit_date
  const shouldShowVisitDate = () => {
    return selectedResponses.some(response => 
      response.toLowerCase().includes('mau cek lokasi') || 
      response.toLowerCase().includes('jadwal cek lokasi')
    );
  };

  // FETCH KONSUMEN DATA - Ditambahkan seperti di Add Modal
  useEffect(() => {
    if (visible && followup?.konsumen_id) {
      fetchKonsumenData();
    }
  }, [visible, followup?.konsumen_id]);

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

  // UPDATE KONSUMEN CONTACT - Ditambahkan seperti di Add Modal
  const updateKonsumenContact = async () => {
    try {
      await konsumenService.updateKonsumen(followup.konsumen_id, editableContact);
    } catch (error) {
      console.error('Error updating konsumen contact:', error);
    }
  };

  useEffect(() => {
    if (visible && followup) {
      fetchOptions();
      
      // Parse result menjadi array untuk multiple choice
      const resultArray = followup.result ? followup.result.split(', ').map((r: string) => r.trim()) : [];
      setSelectedResponses(resultArray);
      
      setFormData({
        type: followup.type,
        notes: followup.notes || '',
        response: followup.response || '',
        next_followup_date: followup.next_followup_date || '',
        result: followup.result || '',
        status: followup.followup_status?.name || 'Warm',
        visit_date: followup.visit_date || '',
      });
      
      if (followup.next_followup_date) {
        setTempDate(new Date(followup.next_followup_date.replace(' ', 'T')));
      } else {
        setTempDate(new Date());
      }
      
      if (followup.visit_date) {
        setTempVisitDate(new Date(followup.visit_date.replace(' ', 'T')));
      } else {
        setTempVisitDate(new Date());
      }
    }
  }, [followup, visible]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [responses, notes] = await Promise.all([
        konsumenService.getKonsumenResponses(),
        konsumenService.getFollowupNotes()
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

  // Handler untuk toggle response (multiple choice)
  const toggleResponse = (responseName: string) => {
    let newSelectedResponses: string[];
    
    if (selectedResponses.includes(responseName)) {
      newSelectedResponses = selectedResponses.filter(r => r !== responseName);
    } else {
      newSelectedResponses = [...selectedResponses, responseName];
    }
    
    setSelectedResponses(newSelectedResponses);
    
    const updatedFormData = { 
      ...formData, 
      result: newSelectedResponses.join(', ') 
    };
    
    // Reset visit_date jika tidak ada lagi response yang memerlukan visit_date
    const needsVisitDate = newSelectedResponses.some(response => 
      response.toLowerCase().includes('mau cek lokasi') || 
      response.toLowerCase().includes('jadwal cek lokasi')
    );
    
    if (!needsVisitDate) {
      updatedFormData.visit_date = '';
    }
    
    setFormData(updatedFormData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      // Format manual - waktu lokal (tanpa UTC shift)
      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;

      setFormData({ ...formData, next_followup_date: formatted });
    }

    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };


  const handleVisitDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowVisitDatePicker(false);
    }
    
    if (selectedDate) {
      setTempVisitDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowVisitTimePicker(true);
      }
    }
  };

  const handleVisitTimeChange = (event: any, selectedTime?: Date) => {
    setShowVisitTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempVisitDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      // Format manual agar TIDAK pindah ke UTC
      const year = finalDateTime.getFullYear();
      const month = String(finalDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(finalDateTime.getDate()).padStart(2, '0');
      const hours = String(finalDateTime.getHours()).padStart(2, '0');
      const minutes = String(finalDateTime.getMinutes()).padStart(2, '0');

      const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;

      setFormData({ ...formData, visit_date: formatted });
    }

    if (Platform.OS === 'ios') {
      setShowVisitDatePicker(false);
    }
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

    // FIXED: Validasi response hanya jika "Berhasil terhubung" dipilih (sama seperti Add Modal)
    if (formData.notes === 'Berhasil terhubung' && selectedResponses.length === 0) {
      showErrorToast('Response konsumen harus dipilih minimal 1');
      return;
    }

    // Validasi visit_date jika response mengandung "mau cek lokasi"
    if (shouldShowVisitDate() && !formData.visit_date) {
      showErrorToast('Jadwal cek lokasi harus diisi');
      return;
    }

    try {
      setSaving(true);
      // Update konsumen contact terlebih dahulu (sama seperti Add Modal)
      await updateKonsumenContact();
      await followupService.updateFollowup(followup.id, formData);
      showSuccessToast 'Follow up berhasil diupdate');
      onSuccess();
    } catch (error: any) {
      showErrorToast(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Cold': '#6b7280',
      'Warm': '#f59e0b',
      'Hot': '#ef4444',
      'Cancel': '#374151',
      'Closing': '#10b981',
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
            <TextInput
              style={styles.input}
              value={editableContact.whatsapp}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, whatsapp: text })
              }
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
            />
            <Text style={styles.inputHint}>
              Nomor ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      case 'email':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Konsumen</Text>
            <TextInput
              style={styles.input}
              value={editableContact.email}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, email: text })
              }
              placeholder="email@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>
              Email ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      case 'visit':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alamat Konsumen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editableContact.address}
              onChangeText={(text) => 
                setEditableContact({ ...editableContact, address: text })
              }
              placeholder="Alamat lengkap"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.inputHint}>
              Alamat ini akan tersimpan ke data konsumen
            </Text>
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
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, facebook: text })
                }
                placeholder="Facebook URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.instagram}
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, instagram: text })
                }
                placeholder="Instagram URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialMediaItem}>
              <TextInput
                style={[styles.input, styles.socialMediaInput]}
                value={editableContact.tiktok}
                onChangeText={(text) => 
                  setEditableContact({ ...editableContact, tiktok: text })
                }
                placeholder="TikTok URL"
                placeholderTextColor="#6b7280"
                autoCapitalize="none"
              />
            </View>
            
            <Text style={styles.inputHint}>
              Social media ini akan tersimpan ke data konsumen
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (!followup) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Follow Up</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Tipe Follow Up */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipe Follow Up *</Text>
              <View style={styles.typeGrid}>
                {[
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'email', label: 'Email' },
                  { value: 'visit', label: 'Kunjungan' },
                  { value: 'socmed', label: 'Socmed' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOptionNew,
                      formData.type === type.value && styles.typeOptionNewActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.value as any })}
                  >
                    <Text style={[
                      styles.typeOptionNewText,
                      formData.type === type.value && styles.typeOptionNewTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderContactField()}

            {/* Keterangan Followup - Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan Followup *</Text>
              {loadingOptions ? (
                <ActivityIndicator size="small" color="#312a7a" />
              ) : (
                <View style={styles.dropdownContainer}>
                  {followupNotes.map((note) => (
                    <TouchableOpacity
                      key={note.id}
                      style={[
                        styles.dropdownOption,
                        formData.notes === note.name && styles.dropdownOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, notes: note.name })}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        formData.notes === note.name && styles.dropdownOptionTextActive
                      ]}>
                        {note.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Response Konsumen - Multiple Choice - Hanya muncul jika "Berhasil terhubung" */}
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
                            isSelected && styles.dropdownOptionActive
                          ]}
                          onPress={() => toggleResponse(response.name)}
                        >
                          <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxActive
                          ]}>
                            {isSelected && (
                              <Text style={styles.checkboxIcon}>✓</Text>
                            )}
                          </View>
                          <Text style={[
                            styles.dropdownOptionText,
                            isSelected && styles.dropdownOptionTextActive
                          ]}>
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
                    <Text style={styles.selectedResponsesText}>
                      {selectedResponses.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Jadwal Cek Lokasi - Hanya muncul jika response mengandung "mau cek lokasi" */}
            {shouldShowVisitDate() && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Jadwal Cek Lokasi *</Text>
                
                {formData.visit_date ? (
                  <View style={styles.dateTimeDisplay}>
                    <Text style={styles.dateTimeText}>
                      {new Date(formData.visit_date.replace(' ', 'T')).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearDateBtn}
                      onPress={clearVisitDate}
                    >
                      <Text style={styles.clearDateText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowVisitDatePicker(true)}
                >
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

            {/* Status Lead */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status Lead *</Text>
              <View style={styles.statusGrid}>
                {['Cold', 'Warm', 'Hot', 'Cancel', 'Closing'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && [
                        styles.statusOptionActive,
                        { backgroundColor: getStatusColor(status) }
                      ]
                    ]}
                    onPress={() => setFormData({ ...formData, status: status as any })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      formData.status === status && styles.statusOptionTextActive
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Follow Up Berikutnya */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Follow Up Berikutnya</Text>
              
              {formData.next_followup_date ? (
                <View style={styles.dateTimeDisplay}>
                  <Text style={styles.dateTimeText}>
                    {new Date(formData.next_followup_date.replace(' ', 'T')).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearDateBtn}
                    onPress={clearNextFollowup}
                  >
                    <Text style={styles.clearDateText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
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


const styles = StyleSheet.create({
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterExpandIcon: {
    fontSize: 16,
    color: '#6b7280',
  },

  consumerStatsContainer: {
    marginTop: 20,
    paddingHorizontal: 0,
  },

  consumerStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1c1c1c',
  },

  consumerStatsScroll: {
    gap: 14,
    paddingRight: 16,
  },

  consumerStatsCard: {
    backgroundColor: '#ffffff',
    width: 150,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',

    // clean modern shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  consumerStatsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },

  consumerStatsLabel: {
    fontSize: 13,
    color: '#666',
  },

  // Type Grid - Clean
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOptionNew: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: '48%',
  },
  typeOptionNewActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  typeOptionNewText: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  typeOptionNewTextActive: {
    color: '#fff',
  },

  // Dropdown Container - Professional
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    backgroundColor: '#fff',
    // maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownOptionActive: {
    backgroundColor: '#f9fafb',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: '#374151',
  },
  dropdownOptionTextActive: {
    color: '#312a7a',
    fontWeight: '500',
  },

  // Status Grid - Minimalist
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Date Picker - Clean
  datePickerButton: {
    backgroundColor: '#312a7a',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
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
  dateTimeText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  clearDateBtn: {
    backgroundColor: '#ef4444',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearDateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Detail Card - Simplified
  detailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  detailCode: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  detailStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4b5563',
  },

  // Action Buttons - Professional
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: '#312a7a',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },

  // Detail Section - Clean
  detailSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 100,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  // Followup Count Badge
  followupCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  followupCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Followup Card - Minimalist
  followupCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  followupType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  followupDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  followupStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  followupStatusText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '500',
  },
  followupResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  followupResultText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '500',
  },
  followupNotes: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 18,
  },
  followupResponse: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followupResponseLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 3,
  },
  followupResponseText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  followupNext: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  followupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  followupEditBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followupEditText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty State
  emptyFollowup: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyFollowupText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  
  followupList: {
    gap: 10,
  },
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
    marginBottom: 10,
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
  
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  sectionBadge: {
    backgroundColor: '#312a7a',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusOptionActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeOptionActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultOptionActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  resultOptionText: {
    fontSize: 13,
    color: '#666',
  },
  resultOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statusLeadOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusLeadOptionActive: {
    borderColor: 'transparent',
  },
  statusLeadOptionText: {
    fontSize: 13,
    color: '#666',
  },
  statusLeadOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  
  followupDeleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  followupDeleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 12,
  },
  socialMediaGroup: {
    marginTop: 0,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialMediaIcon: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  socialMediaIconText: {
    fontSize: 24,
  },
  socialMediaInput: {
    flex: 1,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    minWidth: '30%',
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sourceButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sourceButtonText: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  sourceButtonTextActive: {
    color: '#fff',
  },
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  dropdownPlaceholder: {
    color: '#6b7280',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  dropdownModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  checkmark: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
  },
  contactSection: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginHorizontal: -4,
  },
  sourceCheckmark: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 13,
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },

  dropdownOptionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  checkboxActive: {
    backgroundColor: '#312a7a',
    borderColor: '#312a7a',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedCount: {
    color: '#312a7a',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedResponsesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  selectedResponsesLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedResponsesText: {
    fontSize: 13,
    color: '#312a7a',
    lineHeight: 18,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#312a7a',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  chipTextActive: {
    color: '#fff',
  },
  
  dropdownButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#312a7a',
  },
  
  dropdownButtonTextActive: {
    color: '#312a7a',
    fontWeight: '600',
  },
  sourceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sourceOptionActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#312a7a',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // ADDED: Prevent radio from shrinking
  },
  radioActive: {
    borderColor: '#312a7a',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#312a7a',
    position: 'absolute', // ADDED: Position absolute untuk dot
  },
  sourceOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1, // ADDED: Make text flexible
  },
  sourceOptionTextActive: {
    color: '#312a7a',
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  phonePrefix: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 12,
  },

});

const newStyles = StyleSheet.create({

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9c9c9cff', // warna utama kamu
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  header: {
    backgroundColor: '#165044',
    paddingTop: 16,
    paddingBottom: 24,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
    paddingHorizontal: 16
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#d1fae5",
    marginTop: 4,
  },

  // Statistik
  statsScroll: {
    marginTop: 20,
    paddingRight: 10
  },

  statCardPrimary: {
    backgroundColor: '#0f3b32',
    padding: 16,
    borderRadius: 14,
    width: 120,
    marginRight: 12,
  },

  statCard: {
    backgroundColor: '#1f5f50',
    padding: 16,
    borderRadius: 14,
    width: 120,
    marginRight: 12,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },

  statLabel: {
    fontSize: 12,
    color: "#d1fae5",
    marginTop: 6,
  },

  // Search
  searchWrapper: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 12,
    fontSize: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },

  // Filter
  filterWrapper: {
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  listWrapper: {
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: 16,
  },
  filterScroll: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#165044",
    borderColor: "#165044",
  },
  filterText: {
    color: "#111827",
  },
  filterTextActive: {
    color: "#ffffff",
  },

  // LIST
  list: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  listCard: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    gap: 12,
  },
  listContent: {
    flex: 1,
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  listSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  listDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  searchIcon: {
    fontSize: 22,
    color: '#ffffff',
    padding: 4,
  },

  closeIcon: {
    fontSize: 18,
    color: '#ffffff',
    paddingHorizontal: 10,
  },

  searchBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3b32',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
  },

  searchInputHeader: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },

  // COLOR VARIANTS
  badgeHot: { backgroundColor: '#DC2626' },      // merah
  badgeWarm: { backgroundColor: '#F59E0B' },     // oranye
  badgeCold: { backgroundColor: '#3B82F6' },     // biru
  badgeCancel: { backgroundColor: '#6B7280' },   // abu
  badgeClosing: { backgroundColor: '#16A34A' },  // hijau

});




export default KonsumenScreen;