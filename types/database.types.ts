export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      car_images: {
        Row: {
          car_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
        }
        Insert: {
          car_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
        }
        Update: {
          car_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          brand: string
          category: string
          color: string
          created_at: string
          description: string | null
          fuel_type: string
          id: string
          model: string
          plate_number: string
          price_per_day: number
          seats: number
          status: Database["public"]["Enums"]["car_status"]
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          category: string
          color: string
          created_at?: string
          description?: string | null
          fuel_type: string
          id?: string
          model: string
          plate_number: string
          price_per_day: number
          seats: number
          status?: Database["public"]["Enums"]["car_status"]
          transmission: string
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          fuel_type?: string
          id?: string
          model?: string
          plate_number?: string
          price_per_day?: number
          seats?: number
          status?: Database["public"]["Enums"]["car_status"]
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          booking_period: unknown
          cancellation_reason: string | null
          car_id: string
          created_at: string
          customer_id: string
          id: string
          pickup_date: string
          price_per_day_snapshot: number
          rejection_reason: string | null
          rental_days: number | null
          return_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          subtotal: number | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          booking_period?: unknown
          cancellation_reason?: string | null
          car_id: string
          created_at?: string
          customer_id: string
          id?: string
          pickup_date: string
          price_per_day_snapshot: number
          rejection_reason?: string | null
          rental_days?: number | null
          return_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          subtotal?: number | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          booking_period?: unknown
          cancellation_reason?: string | null
          car_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          pickup_date?: string
          price_per_day_snapshot?: number
          rejection_reason?: string | null
          rental_days?: number | null
          return_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          subtotal?: number | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_reservation_status: {
        Args: {
          p_reason?: string
          p_reservation_id: string
          p_status: Database["public"]["Enums"]["reservation_status"]
        }
        Returns: {
          booking_period: unknown
          cancellation_reason: string | null
          car_id: string
          created_at: string
          customer_id: string
          id: string
          pickup_date: string
          price_per_day_snapshot: number
          rejection_reason: string | null
          rental_days: number | null
          return_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          subtotal: number | null
          total_price: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_my_reservation: {
        Args: { p_reason: string; p_reservation_id: string }
        Returns: {
          booking_period: unknown
          cancellation_reason: string | null
          car_id: string
          created_at: string
          customer_id: string
          id: string
          pickup_date: string
          price_per_day_snapshot: number
          rejection_reason: string | null
          rental_days: number | null
          return_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          subtotal: number | null
          total_price: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_reservation: {
        Args: { p_car_id: string; p_pickup_date: string; p_return_date: string }
        Returns: {
          booking_period: unknown
          cancellation_reason: string | null
          car_id: string
          created_at: string
          customer_id: string
          id: string
          pickup_date: string
          price_per_day_snapshot: number
          rejection_reason: string | null
          rental_days: number | null
          return_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          subtotal: number | null
          total_price: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_car_available: {
        Args: { p_car_id: string; p_pickup_date: string; p_return_date: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "admin"
      car_status: "available" | "maintenance" | "inactive"
      reservation_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin"],
      car_status: ["available", "maintenance", "inactive"],
      reservation_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "rejected",
      ],
    },
  },
} as const
