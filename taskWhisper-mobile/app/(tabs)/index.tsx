import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Search, Plus, LayoutGrid, List as ListIcon } from 'lucide-react-native';
import { TaskCard } from '@/components/TaskCard';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchTasks } from '@/app/store/thunks/taskThunks';
import { Task, TaskStatus } from '@/app/store/types';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useAppDispatch();
  const { list: tasks, isLoading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  const loadTasks = useCallback(async () => {
    try {
      await dispatch(fetchTasks()).unwrap();
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning,';
    if (hours < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const renderBoardView = () => (
    <ScrollView
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.boardContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => (
        <View key={status} style={[styles.column, { width: width * 0.85, backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f1f5f9' }]}>
          <View style={styles.columnHeader}>
            <Text style={[styles.columnTitle, { color: colors.text }]}>{status}</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.countText}>{tasks.filter(t => t.status === status).length}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {tasks.filter(t => t.status === status).map(task => (
              <TaskCard key={task.id} task={task} onPress={() => router.push({ pathname: '/modal', params: { taskId: task.id } })} />
            ))}
            {tasks.filter(t => t.status === status).length === 0 && (
              <Text style={{ textAlign: 'center', color: colors.icon, marginTop: 20 }}>No tasks</Text>
            )}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );

  const renderListView = () => (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          onPress={() => router.push({ pathname: '/modal', params: { taskId: item.id } })}
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        !isLoading ? <Text style={{ textAlign: 'center', color: colors.icon, marginTop: 20 }}>No tasks found</Text> : null
      }
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.icon }]}>{getGreeting()}</Text>
          <Text style={[styles.username, { color: colors.text }]}>{user?.full_name || user?.email?.split('@')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/modal')}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.controls}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.icon} />
          <Text style={[styles.searchText, { color: colors.icon }]}>Search tasks...</Text>
        </View>
        <View style={[styles.viewSwitcher, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'board' && { backgroundColor: colors.tint + '20' }]}
            onPress={() => setViewMode('board')}
          >
            <LayoutGrid size={20} color={viewMode === 'board' ? colors.tint : colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: colors.tint + '20' }]}
            onPress={() => setViewMode('list')}
          >
            <ListIcon size={20} color={viewMode === 'list' ? colors.tint : colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !refreshing && tasks.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      )}

      {error && (
        <Text style={{ color: 'red', textAlign: 'center', margin: 10 }}>{error}</Text>
      )}

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'board' ? renderBoardView() : renderListView()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchText: {
    fontSize: 14,
  },
  viewSwitcher: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  switchBtn: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  boardContainer: {
    paddingHorizontal: 10,
    gap: 16,
    paddingBottom: 20,
  },
  column: {
    borderRadius: 16,
    padding: 16,
    height: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
