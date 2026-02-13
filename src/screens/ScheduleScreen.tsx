/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Linking
} from 'react-native';
import scheduleService, { Schedule, ScheduleStatistics } from '../services/scheduleService';

// Icon component menggunakan emoji/unicode
const Icon = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'today': '📅',
    'calendar': '🗓️',
    'calendar-outline': '📆',
    'time': '⏰',
    'alert-circle': '⚠️',
    'refresh': '🔄',
    'chevron-back': '◀',
    'chevron-forward': '▶',
    'chevron-down': '▼',
    'phone': '📞',
    'call-outline': '📱',
    'mail': '✉️',
    'logo-whatsapp': '💬',
    'location': '📍',
    'ellipsis-horizontal': '⋯',
    'checkmark': '✓',
    'funnel': '🔍',
    'close': '✕',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '•'}
    </Text>
  );
};

const capitalizeFirst = (text: string) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const timeDifferenceText = (targetDate: string | Date) => {
  if (!targetDate) return '';

  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return `Sudah lewat`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 60) {
    return `${diffMinutes} menit lagi`;
  } else if (diffHours < 24) {
    return `${diffHours} jam lagi`;
  } else if (diffDays < 7) {
    return `${diffDays} hari lagi`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} minggu lagi`;
  } else {
    return `${diffMonths} bulan lagi`;
  }
};



type FilterType = 'all' | 'today' | 'week' | 'month' | 'upcoming' | 'overdue';

function ScheduleScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [statistics, setStatistics] = useState<ScheduleStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('today');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    loadData();
    loadStatistics();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedFilter, allSchedules, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const calendarRes = await scheduleService.getCalendarSchedule(currentMonth, currentYear);
      
      let combinedSchedules: Schedule[] = [];
      
      if (!Array.isArray(calendarRes.data)) {
        const schedulesByDate = calendarRes.data as Record<string, Schedule[]>;
        combinedSchedules = Object.values(schedulesByDate).flat();
      } else {
        combinedSchedules = calendarRes.data;
      }

      const upcomingRes = await scheduleService.getUpcomingSchedule(90);
      if (upcomingRes.data.data) {
        combinedSchedules = [...combinedSchedules, ...upcomingRes.data.data];
      }

      const overdueRes = await scheduleService.getOverdueSchedules();
      if (overdueRes.data) {
        if (Array.isArray(overdueRes.data)) {
          combinedSchedules = [...combinedSchedules, ...overdueRes.data];
        } else {
          const overdueSchedules = Object.values(overdueRes.data).flat();
          combinedSchedules = [...combinedSchedules, ...overdueSchedules];
        }
      }

      const uniqueSchedules = combinedSchedules.filter((schedule, index, self) =>
        index === self.findIndex((s) => s.id === schedule.id)
      );

      const validSchedules = uniqueSchedules.filter(
        schedule => schedule.schedule_date
      );

      setAllSchedules(validSchedules);
    } catch (error: any) {
      console.error('Load data error:', error);
      Alert.alert('Error', error.message || 'Gagal memuat data schedule');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await scheduleService.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getEarliestScheduleDate = (schedule: Schedule): Date | null => {
    const dates: Date[] = [];

    if (schedule.visit_date) {
      dates.push(new Date(schedule.visit_date));
    }

    if (schedule.next_followup_date) {
      dates.push(new Date(schedule.next_followup_date));
    }

    if (dates.length === 0) return null;
    
    return new Date(Math.min(...dates.map(d => d.getTime())));
  };


  const applyFilter = () => {
    if (allSchedules.length === 0) {
      setSchedules([]);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    let filtered: Schedule[] = [];

    switch (selectedFilter) {
      case 'all':
        filtered = allSchedules;
        break;
        
      case 'today': {
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);

        filtered = allSchedules.filter(schedule => {
          const scheduleDate = getEarliestScheduleDate(schedule);
          if (!scheduleDate) return false;

          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.getTime() === targetDate.getTime();
        });

        break;
      }

      case 'week':
        filtered = allSchedules.filter(schedule => {
          if (!schedule.next_followup_date) return false;
          const scheduleDate = new Date(schedule.next_followup_date);
          return scheduleDate >= weekStart && scheduleDate < weekEnd;
        });
        break;
        
      case 'month':
        filtered = allSchedules.filter(schedule => {
          if (!schedule.next_followup_date) return false;
          const scheduleDate = new Date(schedule.next_followup_date);
          return scheduleDate >= monthStart && scheduleDate <= monthEnd;
        });
        break;
        
      case 'upcoming':
        filtered = allSchedules.filter(schedule => {
          const scheduleDate = getEarliestScheduleDate(schedule);
          if (!scheduleDate) return false;

          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= tomorrow;
        });
        break;

        
      case 'overdue':
        filtered = allSchedules.filter(schedule => {
          if (!schedule.next_followup_date) return false;
          const scheduleDate = new Date(schedule.next_followup_date);
          scheduleDate.setHours(23, 59, 59, 999);
          return scheduleDate < now;
        });
        break;
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.next_followup_date || '').getTime();
      const dateB = new Date(b.next_followup_date || '').getTime();
      return dateA - dateB;
    });

    setSchedules(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await loadStatistics();
    setRefreshing(false);
  }, []);

  const getDaysInWeek = (startDate: Date) => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getDaysInWeek(currentWeekStart);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getScheduleColor = (type: string) => {
    if (type === 'visit') return { bg: '#ececebff', border: '#999898ff' };
    if (type === 'email') return { bg: '#F0FDF4', border: '#181a8aff' };
    if (type === 'whatsapp') return { bg: '#F0FDF4', border: '#0fcc0fff' };
    return { bg: '#EFF6FF', border: '#3B82F6' };
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    const isOverdue = scheduleService.isPast((item.schedule_type === 'followup' ? item.next_followup_date : item.visit_date) || '');
    const colors = getScheduleColor(item.schedule_type === 'followup' ? item.type : item.schedule_type);
    
    return (
      <TouchableOpacity 
        style={[styles.scheduleCard]}
        onPress={() => {
          setSelectedSchedule(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{formatTime((item.schedule_type === 'followup' ? item.next_followup_date : item.visit_date) || '')}</Text>
        </View>
        
        <View style={[styles.cardContent, { 
          backgroundColor: colors.bg,
          borderLeftWidth: 4,
          borderLeftColor: colors.border
        }]}>
          <Text style={styles.statusFU}>{item.followup_status.name}</Text>
          <Text style={styles.cardTitle}>{item.konsumen.name} ({capitalizeFirst(item.schedule_type === 'followup' ? item.type : item.schedule_type)} - {timeDifferenceText((item.schedule_type === 'followup' ? item.next_followup_date : item.visit_date) || '')})</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            { item.result || 'Tidak ada catatan'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#165044" />
          <Text style={styles.loadingText}>Memuat schedule...</Text>
        </View>
      );
    }

    if (schedules.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada schedule</Text>
          <Text style={styles.emptySubtext}>
            Pilih tanggal lain atau filter berbeda
          </Text>
        </View>
      );
    }

    console.log('Rendering schedules:', schedules);

    return (
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderScheduleItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const normalizePhone = (number: string) => {
    if (!number) return '';

    // Hilangkan simbol selain angka
    let cleaned = number.replace(/\D/g, '');

    // Jika diawali 0 → ganti ke 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    // Jika diawali 62 → biarkan
    // Jika diawali 8 (tanpa 0/62) → tambahkan 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  };


  const openAction = (schedule: Schedule) => {
    const konsumen = schedule.konsumen;
    if (!konsumen) return;

    switch (schedule.type) {
      case 'whatsapp': {
        const phone = normalizePhone(konsumen.whatsapp?.replace(/\D/g, ''));
        if (!phone) return Alert.alert("Nomor WhatsApp tidak tersedia");

        const url = `https://wa.me/${phone}`;
        Linking.openURL(url).then((supported) => {
          if (!supported) {
            Alert.alert("WhatsApp tidak ditemukan", "Pastikan aplikasi WhatsApp terinstall.");
          } else {
            Linking.openURL(url);
          }
        });
        break;
      }

      case 'email':
        if (!konsumen.email) return Alert.alert("Email tidak tersedia");
        Linking.openURL(`mailto:${konsumen.email}`);
        break;

      case 'visit':
        if (!konsumen.address) return Alert.alert("Alamat tidak tersedia");
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(konsumen.address)}`);
        break;

      default:
        Alert.alert("Aksi tidak tersedia");
    }
  };


  const getContactInfo = (schedule: Schedule) => {
    if (!schedule || !schedule.type) return null;

    const konsumen = schedule.konsumen || {};

    switch (schedule.type) {
      case 'whatsapp':
        return {
          label: 'WhatsApp',
          value: konsumen.whatsapp || '-'
        };

      case 'email':
        return {
          label: 'Email',
          value: konsumen.email || '-'
        };

      case 'socmed':
        return {
          label: 'Media Sosial',
          value: [
            konsumen.facebook ? `Facebook: ${konsumen.facebook}` : null,
            konsumen.instagram ? `IG: ${konsumen.instagram}` : null,
            konsumen.tiktok ? `TikTok: ${konsumen.tiktok}` : null
          ].filter(Boolean).join('\n')
        };

      case 'visit':
        return {
          label: 'Alamat',
          value: konsumen.address || '-'
        };

      default:
        return null;
    }
  };


  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => navigateWeek('prev')}>
            <Icon name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateWeek('next')}>
            <Icon name="chevron-forward" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const isSelected = isSameDate(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  isSelected && styles.dayItemSelected
                ]}
                onPress={() => {
                  setSelectedDate(day);
                  setSelectedFilter('today');
                }}
              >
                <Text style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected
                ]}>
                  {dayNames[index]}
                </Text>
                <View style={[
                  styles.dayNumber,
                  isTodayDate && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    isTodayDate && !isSelected && styles.dayNumberTextToday,
                    isSelected && styles.dayNumberTextSelected
                  ]}>
                    {day.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Schedule List */}
      {renderContent()}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSchedule && (
              <>
                <Text style={styles.modalTitle}>{selectedSchedule.konsumen.name} | {capitalizeFirst(selectedSchedule.type)}</Text>
                
                <View style={styles.modalSection}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Tanggal & Waktu</Text>
                    <Text style={styles.modalValue}>
                      {scheduleService.formatDate(selectedSchedule.next_followup_date || '')} - 
                      {" "} {formatTime(selectedSchedule.next_followup_date || '')}
                      {" "}
                      <Text style={{ fontStyle: 'italic', color: '#666' }}>
                        ({timeDifferenceText(selectedSchedule.next_followup_date || '')})
                      </Text>
                    </Text>
                  </View>


                  {(() => {
                    const contact = getContactInfo(selectedSchedule);
                    return contact ? (
                      <TouchableOpacity style={styles.modalRow} onPress={() => openAction(selectedSchedule)}>
                        <Text style={styles.modalLabel}>{contact.label}</Text>
                        {selectedSchedule.type === 'socmed' ? (
                          <Text style={styles.modalValue}>
                            {contact.value}
                          </Text>
                        ) :
                          <Text style={[styles.modalValue, { color: '#1a73e8', textDecorationLine: 'underline' }]}>
                            {contact.value}
                          </Text>
                        }
                      </TouchableOpacity>
                    ) : null;
                  })()}



                  {selectedSchedule.notes && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Keterangan</Text>
                      <Text style={styles.modalValue}>
                        {selectedSchedule.notes}
                      </Text>
                    </View>
                  )}
                  
                  {selectedSchedule.result && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Respon Konsumen</Text>
                      <Text style={styles.modalValue}>
                        {selectedSchedule.result}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Tutup</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  calendarHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysRow: {
    paddingHorizontal: 12,
  },
  dayItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 50,
  },
  dayItemSelected: {
    backgroundColor: '#165044',
  },
  dayName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '500',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberToday: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  dayNumberSelected: {
    backgroundColor: '#D4AA00',
    borderRadius: 12,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayNumberTextToday: {
    color: '#165044',
  },
  dayNumberTextSelected: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 60,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    marginTop: -20,
  },
  statusFU: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  modalSection: {
    gap: 16,
  },
  modalRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalButtons: {
    marginTop: 24,
  },
  modalButton: {
    backgroundColor: '#165044',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen;