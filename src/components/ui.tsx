import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { forwardRef, type ComponentProps, type ComponentRef, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, space } from '@/lib/theme';
import { tap } from '@/lib/utils';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// ------------------------------------------------------------------ layout
export function Screen({ children, refreshing, onRefresh, padded = true, footer, edges = 'bottom' }: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  footer?: ReactNode;
  edges?: 'bottom' | 'both' | 'none';
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, edges === 'both' && { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[padded && { padding: space.lg }, { paddingBottom: footer ? space.lg : insets.bottom + space.xl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.green} /> : undefined}>
        {children}
      </ScrollView>
      {footer ? <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>{footer}</View> : null}
    </View>
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[s.card, style]}>{children}</View>;

export const Row = ({ children, style, ...rest }: ViewProps & { children: ReactNode }) => <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;

export const H1 = ({ children }: { children: ReactNode }) => <Text style={s.h1}>{children}</Text>;
export const H2 = ({ children }: { children: ReactNode }) => <Text style={s.h2}>{children}</Text>;
export const Muted = ({ children, style }: { children: ReactNode; style?: any }) => <Text style={[s.muted, style]}>{children}</Text>;
export const Body = ({ children, style }: { children: ReactNode; style?: any }) => <Text style={[s.body, style]}>{children}</Text>;

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md }}>
      <H2>{title}</H2>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

// ------------------------------------------------------------------ controls
export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : variant === 'lime' ? colors.greenDark : colors.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [s.btn, btnStyles[variant], off && { opacity: 0.55 }, pressed && { opacity: 0.85 }, style]}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}
const btnStyles = StyleSheet.create({
  primary: { backgroundColor: colors.green },
  secondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.green },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
  lime: { backgroundColor: colors.lime },
});

export const Input = forwardRef<ComponentRef<typeof TextInput>, TextInputProps & { label?: string; error?: string; icon?: IconName }>(function Input({ label, error, icon, style, ...props }, ref) {
  return (
    <View style={{ marginBottom: space.md }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.inputWrap, !!error && { borderColor: colors.danger }]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={{ marginLeft: space.md }} /> : null}
        <TextInput ref={ref} placeholderTextColor="#9aa595" style={[s.input, style]} {...props} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
});

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={() => { tap(); onPress?.(); }} accessibilityRole="button" accessibilityState={{ selected: !!active }} style={[s.chip, active && s.chipOn]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? '#fff' : colors.text} /> : null}
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, bg = '#e3f3dd', fg = colors.green, icon }: { label: string; bg?: string; fg?: string; icon?: IconName }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[s.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number | null; size?: number }) {
  const v = value ?? 0;
  return (
    <Row style={{ gap: 1 }} accessibilityLabel={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name={v >= i ? 'star' : v >= i - 0.5 ? 'star-half' : 'star-outline'} size={size} color={colors.star} />
      ))}
    </Row>
  );
}

export function Stepper({ value, min = 1, onChange }: { value: number; min?: number; onChange: (n: number) => void }) {
  return (
    <Row style={s.stepper}>
      <Pressable accessibilityLabel="Decrease" onPress={() => onChange(Math.max(min, value - 1))} style={s.stepBtn} hitSlop={6}>
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <Text style={s.stepVal}>{value}</Text>
      <Pressable accessibilityLabel="Increase" onPress={() => onChange(value + 1)} style={s.stepBtn} hitSlop={6}>
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </Row>
  );
}

export function Avatar({ uri, initials, size = 64 }: { uri?: string; initials?: string; size?: number }) {
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: size * 0.36 }}>{initials || '?'}</Text>
    </View>
  );
}

export function ListItem({ icon, title, subtitle, onPress, right, danger }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; right?: ReactNode; danger?: boolean }) {
  return (
    <Pressable onPress={() => { tap(); onPress?.(); }} disabled={!onPress} style={({ pressed }) => [s.item, pressed && { backgroundColor: '#f1f3ec' }]} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[s.itemIcon, danger && { backgroundColor: '#f6e0de' }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.itemTitle, danger && { color: colors.danger }]}>{title}</Text>
        {subtitle ? <Text style={s.muted}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null)}
    </Pressable>
  );
}

// ------------------------------------------------------------------ states
export const Loading = ({ label }: { label?: string }) => (
  <View style={s.center}>
    <ActivityIndicator color={colors.green} size="large" />
    {label ? <Muted style={{ marginTop: space.md }}>{label}</Muted> : null}
  </View>
);

export function EmptyState({ icon = 'leaf-outline', title, text, action, onAction }: { icon?: IconName; title: string; text?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.center}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.green} />
      </View>
      <Text style={[s.h2, { textAlign: 'center' }]}>{title}</Text>
      {text ? <Muted style={{ textAlign: 'center', marginTop: 6, marginBottom: space.lg, maxWidth: 280 }}>{text}</Muted> : null}
      {action ? <Button title={action} onPress={onAction} /> : null}
    </View>
  );
}

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <EmptyState icon="cloud-offline-outline" title="Couldn't load this" text={message} action={onRetry ? 'Try again' : undefined} onAction={onRetry} />
);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingHorizontal: space.lg, paddingTop: space.md },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: space.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow },
  h1: { fontSize: 28, fontWeight: '600', color: colors.greenDark, letterSpacing: -0.6 },
  h2: { fontSize: 18, fontWeight: '600', color: colors.greenDark, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  link: { fontSize: 14, color: colors.green, fontWeight: '600' },
  btn: { minHeight: 50, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: space.xl },
  btnText: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  input: { flex: 1, minHeight: 48, paddingHorizontal: space.md, fontSize: 16, color: colors.text },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 38, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '600' },
  stepper: { backgroundColor: '#fff', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  stepBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  stepVal: { minWidth: 34, textAlign: 'center', fontSize: 15, fontWeight: '600', color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.lg },
  itemIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#e3f3dd', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  center: { alignItems: 'center', justifyContent: 'center', padding: space.xxl, flex: 1, minHeight: 280 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#e3f3dd', alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
});
