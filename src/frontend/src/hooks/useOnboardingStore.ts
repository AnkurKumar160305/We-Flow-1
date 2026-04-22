import { useCallback, useState } from "react";
import type { OnboardingState, OnboardingStep } from "../types";

const INITIAL_STATE: OnboardingState = {
  step: 1,
  workspaceName: "",
  teamSize: "",
  departments: [],
  inviteEmails: [],
  role: "",
};

export interface OnboardingStore {
  state: OnboardingState;
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setWorkspaceName: (name: string) => void;
  setTeamSize: (size: string) => void;
  setRole: (role: string) => void;
  toggleDepartment: (dept: string) => void;
  addInviteEmail: (email: string) => void;
  removeInviteEmail: (email: string) => void;
  reset: () => void;
  isStepComplete: () => boolean;
}

export function useOnboardingStore(): OnboardingStore {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const setStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.min(4, prev.step + 1) as OnboardingStep,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(1, prev.step - 1) as OnboardingStep,
    }));
  }, []);

  const setWorkspaceName = useCallback((workspaceName: string) => {
    setState((prev) => ({ ...prev, workspaceName }));
  }, []);

  const setTeamSize = useCallback((teamSize: string) => {
    setState((prev) => ({ ...prev, teamSize }));
  }, []);

  const setRole = useCallback((role: string) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const toggleDepartment = useCallback((dept: string) => {
    setState((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  }, []);

  const addInviteEmail = useCallback((email: string) => {
    setState((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.includes(email)
        ? prev.inviteEmails
        : [...prev.inviteEmails, email],
    }));
  }, []);

  const removeInviteEmail = useCallback((email: string) => {
    setState((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email),
    }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const isStepComplete = useCallback((): boolean => {
    switch (state.step) {
      case 1:
        return state.workspaceName.trim().length >= 2;
      case 2:
        return state.role.length > 0;
      case 3:
        return state.departments.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    setStep,
    nextStep,
    prevStep,
    setWorkspaceName,
    setTeamSize,
    setRole,
    toggleDepartment,
    addInviteEmail,
    removeInviteEmail,
    reset,
    isStepComplete,
  };
}
