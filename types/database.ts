/**
 * 数据库类型定义
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// 数据库表的定义
export interface Database {
  public: {
    Tables: {
      job_worth_evaluations: {
        Row: {
          id: string;
          input_data: Json;
          result_score: number;
          created_at: string;
          client_info: Json | null;
        };
        Insert: {
          id?: string;
          input_data: Json;
          result_score: number;
          created_at?: string;
          client_info?: Json | null;
        };
        Update: {
          id?: string;
          input_data?: Json;
          result_score?: number;
          created_at?: string;
          client_info?: Json | null;
        };
      };
    };
    Functions: {
      get_average_job_worth_score: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
}

// 提取评估表类型
export type JobWorthEvaluation = Database['public']['Tables']['job_worth_evaluations']['Row'];
export type InsertJobWorthEvaluation = Database['public']['Tables']['job_worth_evaluations']['Insert'];
export type UpdateJobWorthEvaluation = Database['public']['Tables']['job_worth_evaluations']['Update']; 