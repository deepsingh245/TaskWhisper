import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mic, X, Check, Calendar, Tag, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

const MOCK_TRANSCRIPT = "Create a task to review the authentication module by tomorrow high priority";
const MOCK_PARSED = {
  title: "Review authentication module",
  dueDate: "Tomorrow",
  priority: "High",
  tags: ["Backend", "Auth"],
  status: "To Do"
};

export default function VoiceModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'review'>('idle');
  const [transcript, setTranscript] = useState('');
  
  // Animation values
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === 'recording') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleMicPress = () => {
    if (state === 'idle') {
      setState('recording');
      // Simulate recording duration
      setTimeout(() => {
        setState('processing');
        // Simulate processing
        setTimeout(() => {
          setTranscript(MOCK_TRANSCRIPT);
          setState('review');
        }, 1500);
      }, 2000);
    }
  };

  const handleSave = () => {
    // Logic to save task would go here
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>New Voice Task</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {state !== 'review' ? (
          <View style={styles.recordingContainer}>
            <View style={styles.micWrapper}>
              {state === 'recording' && (
                <Animated.View style={[styles.pulseRing, { backgroundColor: colors.tint + '40' }, animatedStyle]} />
              )}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: state === 'recording' ? '#ef4444' : colors.tint }
                ]}
                onPress={handleMicPress}
                disabled={state === 'processing'}
              >
                {state === 'processing' ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Mic size={48} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.statusText, { color: colors.text }]}>
              {state === 'idle' && "Tap to start listening"}
              {state === 'recording' && "Listening..."}
              {state === 'processing' && "Processing..."}
            </Text>
            
            {state === 'recording' && (
              <View style={styles.waveContainer}>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={[styles.waveBar, { backgroundColor: colors.tint, height: 20 + Math.random() * 30 }]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <ScrollView style={styles.reviewContainer}>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.icon }]}>TRANSCRIPT</Text>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{transcript}</Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.icon }]}>EXTRACTED DETAILS</Text>
              
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>Title</Text>
                <Text style={[styles.fieldValue, { color: colors.text }]}>{MOCK_PARSED.title}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>Due Date</Text>
                <View style={styles.tagContainer}>
                  <Calendar size={14} color={colors.tint} />
                  <Text style={[styles.fieldValue, { color: colors.text }]}>{MOCK_PARSED.dueDate}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>Priority</Text>
                <View style={[styles.badge, { backgroundColor: '#ef444420' }]}>
                  <Text style={[styles.badgeText, { color: '#ef4444' }]}>{MOCK_PARSED.priority}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>Tags</Text>
                <View style={styles.tagsWrapper}>
                  {MOCK_PARSED.tags.map(tag => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.background }]}>
                      <Tag size={12} color={colors.icon} />
                      <Text style={[styles.tagText, { color: colors.icon }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={() => setState('idle')}>
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.tint, borderColor: colors.tint }]} onPress={handleSave}>
                <Check size={20} color="#fff" />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  micWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 60,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  reviewContainer: {
    flex: 1,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.7,
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0', // simplistic divider
    opacity: 0.1,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
