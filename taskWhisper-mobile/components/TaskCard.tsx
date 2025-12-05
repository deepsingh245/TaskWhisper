import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Calendar, Tag } from 'lucide-react-native';

interface TaskCardProps {
  title: string;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  tags?: string[];
  status: 'To Do' | 'In Progress' | 'Done';
}

export function TaskCard({ title, dueDate, priority, tags = [], status }: TaskCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return colors.text;
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(priority) + '20' }]}>
          <Text style={[styles.badgeText, { color: getPriorityColor(priority) }]}>{priority}</Text>
        </View>
        {dueDate && (
          <View style={styles.dateContainer}>
            <Calendar size={12} color={colors.icon} />
            <Text style={[styles.dateText, { color: colors.icon }]}>{dueDate}</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{title}</Text>
      
      <View style={styles.footer}>
        <View style={styles.tags}>
          {tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.background }]}>
              <Tag size={10} color={colors.icon} />
              <Text style={[styles.tagText, { color: colors.icon }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
  },
});
