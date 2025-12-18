import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mic, X, Check, Calendar as CalendarIcon, Tag, Clock, Pause, RotateCcw, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { createTask, updateTask } from './store/thunks/taskThunks';
import { Picker } from '@react-native-picker/picker';

import { uploadVoiceTaskFn } from '@/lib/voicetask';
import { TaskPriority, TaskStatus } from '@/constants/api.constant';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function TaskModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;
  const isEditMode = !!taskId;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const { list: tasks } = useAppSelector(state => state.tasks);

  const [activeTab, setActiveTab] = useState<'manual' | 'voice'>('manual');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Voice State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const pulse = useSharedValue(1);

  // Load task for edit
  useEffect(() => {
    if (isEditMode) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setStatus(task.status);
        setDate(task.due_date ? new Date(task.due_date) : undefined);
      }
    }
  }, [taskId, tasks]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  // Animation effect
  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isRecording]);

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required to record voice tasks.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      processVoice(uri);
    }
  };

  const processVoice = async (uri: string) => {
    setIsProcessing(true);
    const result = await uploadVoiceTaskFn(uri);
    setIsProcessing(false);

    if (result.success && result.data) {
      const data = result.data;
      setTranscript(data.transcript || '');

      // Populate form
      setTitle(data.title || title);
      setDescription(data.description || description);
      if (data.priority) setPriority(data.priority.toLowerCase() as TaskPriority);
      if (data.status) setStatus(data.status.toLowerCase() as TaskStatus);
      if (data.dueDate) setDate(new Date(data.dueDate));

      // Switch to manual tab to review
      setActiveTab('manual');
      Alert.alert("Success", "Voice processed successfully. Please review the details.");
    } else {
      Alert.alert("Error", "Failed to process voice command.");
    }
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    const taskData = {
      title,
      description,
      priority,
      status,
      due_date: date || null,
      updated_at: new Date().toISOString(),
      // Adding required fields for creation
      ...(isEditMode ? {} : {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        user_id: 'current-user', // Backend handles this usually, but strict typing might need it
        tag: 'General'
      })
    };

    try {
      if (isEditMode) {
        await dispatch(updateTask({ id: taskId, data: taskData })).unwrap();
        Alert.alert("Success", "Task updated!");
      } else {
        await dispatch(createTask(taskData)).unwrap();
        Alert.alert("Success", "Task created!");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save task");
    }
  };

  const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <Text style={[styles.label, { color: colors.text }]}>{children}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? 'Edit Task' : 'New Task'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manual' && { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}
          onPress={() => setActiveTab('manual')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'manual' ? colors.tint : colors.icon }]}>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' && { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}
          onPress={() => setActiveTab('voice')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'voice' ? colors.tint : colors.icon }]}>Voice AI</Text>
          {activeTab !== 'voice' && <View style={[styles.badgeDot, { backgroundColor: colors.tint }]} />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'manual' ? (
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <FormLabel>Title</FormLabel>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Task title"
                placeholderTextColor={colors.icon}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <FormLabel>Priority</FormLabel>
                <View style={[styles.selectContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Picker
                    selectedValue={priority}
                    onValueChange={(itemValue: TaskPriority) => setPriority(itemValue)}
                    style={styles.selectButton}
                    dropdownIconColor={colors.icon}
                  >
                    {Object.values(TaskPriority).map((p) => (
                      <Picker.Item key={p} label={p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()} value={p} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <FormLabel>Status</FormLabel>
                <View style={[styles.selectContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Picker
                    selectedValue={status}
                    onValueChange={(itemValue: TaskStatus) => setStatus(itemValue)}
                    style={styles.selectButton}
                    dropdownIconColor={colors.icon}
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <Picker.Item key={s} label={s.replace('-', ' ')} value={s} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <FormLabel>Due Date</FormLabel>
              <TouchableOpacity
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CalendarIcon size={18} color={colors.icon} />
                  <Text style={{ color: date ? colors.text : colors.icon }}>
                    {date ? date.toDateString() : 'Select Due Date'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <FormLabel>Description</FormLabel>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Add details..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.voiceContainer}>
            <View style={styles.micWrapper}>
              {isRecording && (
                <Animated.View style={[styles.pulseRing, { backgroundColor: colors.tint + '40' }, animatedMicStyle]} />
              )}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  { backgroundColor: isRecording ? '#ef4444' : colors.tint }
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : isRecording ? (
                  <Pause size={48} color="#fff" />
                ) : (
                  <Mic size={48} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.statusText, { color: colors.text }]}>
              {isProcessing ? "Processing..." : isRecording ? "Listening..." : "Tap to Speak"}
            </Text>

            <Text style={[styles.hintText, { color: colors.icon }]}>
              {transcript || "Try: \"Create a high priority task to review the code by tomorrow\""}
            </Text>
          </View>
        )}
      </View>

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: colors.tint }]}
          onPress={handleSave}
        >
          <Check size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={[styles.footerBtnText, { color: '#fff' }]}>Save Task</Text>
        </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  selectContainer: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
    height: '100%',
  },
  micWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
    maxWidth: '80%',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
