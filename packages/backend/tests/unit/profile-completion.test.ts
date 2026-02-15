import { describe, it, expect } from 'vitest';
import { calculateProfileCompletion } from '../../src/services/profile-completion';

describe('Profile Completion Calculation', () => {
  describe('All fields null', () => {
    it('should return 0% completion when all fields are null', () => {
      const user = {
        dateOfBirth: null,
        phoneNumber: null,
        aboutMe: null,
        spanishLevel: null,
        preferredClassTypes: null,
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.totalCount).toBe(7);
      expect(result.items.every((item) => !item.completed)).toBe(true);
    });
  });

  describe('One field filled', () => {
    it('should return ~14% completion when 1 out of 7 fields filled', () => {
      const user = {
        dateOfBirth: new Date('1995-06-15'),
        phoneNumber: null,
        aboutMe: null,
        spanishLevel: null,
        preferredClassTypes: null,
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(14); // Math.round(1/7 * 100)
      expect(result.completedCount).toBe(1);
      expect(result.totalCount).toBe(7);
    });
  });

  describe('All fields filled', () => {
    it('should return 100% completion when all fields are filled', () => {
      const user = {
        dateOfBirth: new Date('1995-06-15'),
        phoneNumber: '+1 555-123-4567',
        aboutMe: 'I am a student learning Spanish',
        spanishLevel: 'INTERMEDIATE',
        preferredClassTypes: '["PRIVATE_LESSONS","CONVERSATION_PRACTICE"]',
        learningGoals: 'Become fluent for travel',
        availabilityNotes: 'Weekends preferred',
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(100);
      expect(result.completedCount).toBe(7);
      expect(result.totalCount).toBe(7);
      expect(result.items.every((item) => item.completed)).toBe(true);
    });
  });

  describe('Partial completion', () => {
    it('should return ~57% completion when 4 out of 7 fields filled', () => {
      const user = {
        dateOfBirth: new Date('1995-06-15'),
        phoneNumber: '+1 555-123-4567',
        aboutMe: 'I am a student',
        spanishLevel: 'BEGINNER',
        preferredClassTypes: null,
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(57); // Math.round(4/7 * 100)
      expect(result.completedCount).toBe(4);
      expect(result.totalCount).toBe(7);
    });
  });

  describe('Empty string counts as unfilled', () => {
    it('should not count empty strings as completed', () => {
      const user = {
        dateOfBirth: null,
        phoneNumber: '',
        aboutMe: '   ', // Whitespace only
        spanishLevel: null,
        preferredClassTypes: null,
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(0);
      expect(result.completedCount).toBe(0);
    });
  });

  describe('Empty array counts as unfilled', () => {
    it('should not count empty array (JSON) as completed for preferredClassTypes', () => {
      const user = {
        dateOfBirth: null,
        phoneNumber: null,
        aboutMe: null,
        spanishLevel: null,
        preferredClassTypes: '[]', // Empty JSON array
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(0);
      expect(result.completedCount).toBe(0);
    });

    it('should count non-empty array as completed for preferredClassTypes', () => {
      const user = {
        dateOfBirth: null,
        phoneNumber: null,
        aboutMe: null,
        spanishLevel: null,
        preferredClassTypes: '["PRIVATE_LESSONS"]',
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.percentage).toBe(14); // 1/7
      expect(result.completedCount).toBe(1);
    });
  });

  describe('Field labels and names', () => {
    it('should return correct field labels and names', () => {
      const user = {
        dateOfBirth: null,
        phoneNumber: null,
        aboutMe: null,
        spanishLevel: null,
        preferredClassTypes: null,
        learningGoals: null,
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      expect(result.items).toHaveLength(7);
      expect(result.items[0]).toEqual({
        field: 'dateOfBirth',
        label: 'Date of Birth',
        completed: false,
      });
      expect(result.items[1]).toEqual({
        field: 'phoneNumber',
        label: 'Phone Number',
        completed: false,
      });
      expect(result.items[2]).toEqual({
        field: 'aboutMe',
        label: 'About Me',
        completed: false,
      });
      expect(result.items[3]).toEqual({
        field: 'spanishLevel',
        label: 'Spanish Level',
        completed: false,
      });
      expect(result.items[4]).toEqual({
        field: 'preferredClassTypes',
        label: 'Preferred Class Types',
        completed: false,
      });
      expect(result.items[5]).toEqual({
        field: 'learningGoals',
        label: 'Learning Goals',
        completed: false,
      });
      expect(result.items[6]).toEqual({
        field: 'availabilityNotes',
        label: 'Availability Notes',
        completed: false,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle mixed completion states correctly', () => {
      const user = {
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '',
        aboutMe: 'Something',
        spanishLevel: null,
        preferredClassTypes: '[]',
        learningGoals: 'Goals here',
        availabilityNotes: null,
      };

      const result = calculateProfileCompletion(user);

      // Only dateOfBirth, aboutMe, and learningGoals are filled (3/7)
      expect(result.percentage).toBe(43); // Math.round(3/7 * 100)
      expect(result.completedCount).toBe(3);
    });
  });
});
