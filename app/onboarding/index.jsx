import { View, Text, TouchableOpacity,
  Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'barbell-outline',
    title: 'Unlimited Routines',
    subtitle: 'Create as many workout plans as you need. No limits. No paywall. Ever.',
    accent: '#F5C518',
  },
  {
    icon: 'trending-up-outline',
    title: 'Track Every PR',
    subtitle: 'Auto-detect personal records. See your progress with beautiful charts.',
    accent: '#FF6B6B',
  },
  {
    icon: 'nutrition-outline',
    title: 'Full Nutrition Tracking',
    subtitle: 'Log meals, scan barcodes, track macros. Your complete fitness in one app.',
    accent: '#4ECDC4',
  },
  {
    icon: 'people-outline',
    title: 'Train Together',
    subtitle: 'Follow athletes, share workouts, stay motivated. Community built for lifters.',
    accent: '#A29BFE',
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>

      {/* Skip button */}
      <TouchableOpacity
        onPress={() => router.push('/auth/login')}
        style={{ position: 'absolute', top: 60,
          right: 24, zIndex: 10 }}>
        <Text style={{ color: colors.muted,
          fontSize: font.md }}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}>
        {SLIDES.map((slide, index) => (
          <View key={index} style={{ width,
            flex: 1, alignItems: 'center',
            justifyContent: 'center', padding: 40 }}>
            <Animatable.View
              animation="bounceIn"
              duration={800}
              key={currentSlide}
              style={{ width: 120, height: 120,
                borderRadius: 30,
                backgroundColor: slide.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
                borderWidth: 2,
                borderColor: slide.accent + '40' }}>
              <Ionicons name={slide.icon}
                size={56} color={slide.accent} />
            </Animatable.View>

            <Animatable.Text
              animation="fadeInUp"
              delay={200}
              key={`title-${currentSlide}`}
              style={{ color: colors.white,
                fontSize: 30, fontWeight: '900',
                textAlign: 'center', lineHeight: 36,
                marginBottom: 16 }}>
              {slide.title}
            </Animatable.Text>

            <Animatable.Text
              animation="fadeInUp"
              delay={300}
              key={`sub-${currentSlide}`}
              style={{ color: colors.muted,
                fontSize: font.lg, textAlign: 'center',
                lineHeight: 26 }}>
              {slide.subtitle}
            </Animatable.Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={{ padding: 32 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row',
          justifyContent: 'center', gap: 8,
          marginBottom: 32 }}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
              <View style={{
                width: i === currentSlide ? 24 : 8,
                height: 8, borderRadius: 4,
                backgroundColor: i === currentSlide
                  ? colors.accent : colors.border,
              }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity onPress={handleNext}
          style={{ backgroundColor: colors.accent,
            borderRadius: radius.button, padding: 18,
            alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#0D0D0D',
            fontWeight: '900', fontSize: font.lg,
            textTransform: 'uppercase', letterSpacing: 1 }}>
            {currentSlide === SLIDES.length - 1
              ? 'Get Started 🔥' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Login link */}
        {currentSlide === SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.muted,
              fontSize: font.md }}>
              Already have an account?
              <Text style={{ color: colors.accent,
                fontWeight: '700' }}> Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
