
import React from 'react';

export interface TextInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email';
  description?: string;
  readOnly?: boolean;
}

export interface CodeBlockProps {
  content: string;
}

export interface StepCardProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  id?: string;
}
