import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar, Flag, MoreHorizontal, Clock, CheckCircle2, Circle } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Task, TaskPriority, TaskStatus } from '@/app/store/types';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void; // For actions like Delete/Edit
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onLongPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return '#ef4444'; // Red-500
      case TaskPriority.HIGH: return '#f97316'; // Orange-500
      case TaskPriority.MEDIUM: return '#3b82f6'; // Blue-500
      default: return '#64748b'; // Slate-500
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'rgba(239, 68, 68, 0.1)';
      case TaskPriority.HIGH: return 'rgba(249, 115, 22, 0.1)';
      case TaskPriority.MEDIUM: return 'rgba(59, 130, 246, 0.1)';
      default: return 'rgba(100, 116, 139, 0.1)';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <BlurView
        intensity={colorScheme === 'dark' ? 20 : 60}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[styles.card, { borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
      >
        <View style={styles.header}>
          <View style={styles.tagContainer}>
            <Text style={[styles.tag, { color: colors.icon }]}>{task.tag || 'General'}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(task.priority) }]}>
            <Flag size={12} color={getPriorityColor(task.priority)} style={{ marginRight: 4 }} />
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.footer}>
          <View style={styles.userDateContainer}>
            <Image
              source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}` }}
              style={styles.avatar}
            />
            <View style={styles.dateContainer}>
              <Calendar size={12} color={colors.icon} style={{ marginRight: 4 }} />
              <Text style={[styles.dateText, { color: colors.icon }]}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            {task.status === TaskStatus.DONE ? (
              <CheckCircle2 size={16} color="#10b981" />
            ) : task.status === TaskStatus.IN_PROGRESS ? (
              <Clock size={16} color="#3b82f6" />
            ) : (
              <Circle size={16} color={colors.icon} />
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagContainer: {
    // backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tag: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  userDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  statusContainer: {
    // 
  }
});
