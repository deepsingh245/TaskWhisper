import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User, Settings, LogOut, Bell, Shield, CircleHelp as HelpCircle, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { logoutUser } from '@/app/store/thunks/authThunks';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutUser());
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const MenuItem = ({ icon: Icon, label, color }: { icon: any, label: string, color?: string }) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: (color || colors.tint) + '20' }]}>
          <Icon size={20} color={color || colors.tint} />
        </View>
        <Text style={[styles.menuItemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <ChevronRight size={20} color={colors.icon} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
          <Image
            source={{ uri: user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}` }}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.full_name || user?.name || 'User'}</Text>
        <Text style={[styles.email, { color: colors.icon }]}>{user?.email}</Text>
        <View style={[styles.badge, { backgroundColor: colors.tint + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.tint }]}>Pro Member</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>ACCOUNT</Text>
        <MenuItem icon={User} label="Personal Information" />
        <MenuItem icon={Bell} label="Notifications" />
        <MenuItem icon={Shield} label="Security" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>APP SETTINGS</Text>
        <MenuItem icon={Settings} label="General" />
        <MenuItem icon={HelpCircle} label="Help & Support" />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#ef4444' }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: colors.icon }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
  },
});
