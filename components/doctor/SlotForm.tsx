"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreateSlotForm, SlotType, Slot } from "@/types";

const slotFormSchema = z.object({
  dayOfWeek: z.number().min(0, "Please select a day").max(6, "Invalid day selection"),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(180, "Duration cannot exceed 3 hours"),
  type: z.enum(["in_person", "video_call", "phone_call"]),
  address: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
});

type SlotFormData = z.infer<typeof slotFormSchema>;

interface SlotFormProps {
  onSubmit: (data: CreateSlotForm) => Promise<void>;
  onCancel: () => void;
  initialData?: Slot;
  isEditing?: boolean;
  error?: string | null;
}

export default function SlotForm({ onSubmit, onCancel, initialData, isEditing = false, error }: SlotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SlotFormData>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: {
      dayOfWeek: initialData?.dayOfWeek ?? 1, // Default to Monday
      startTime: initialData?.startTime || "09:00",
      duration: initialData?.duration || 30,
      type: initialData?.type || "in_person",
      address: initialData?.address || "",
      price: initialData?.price ? Number(initialData.price) : 0,
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = async (data: SlotFormData) => {
    setIsSubmitting(true);
    try {
      const formData: CreateSlotForm = {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        duration: data.duration,
        type: data.type,
        address: data.type === "in_person" ? data.address : undefined,
        price: data.price,
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots (9 AM to 6 PM in 15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-600 font-medium">{error}</p>
                {error.includes('conflicts') && (
                  <p className="text-xs text-red-500 mt-1">
                    Try selecting a different time slot or day to avoid conflicts with your existing schedule.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Day of Week Selection */}
        <FormField
          control={form.control}
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day of week" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {day}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Selection */}
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (PKR)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="50"
                    placeholder="e.g. 2000"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Appointment Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_person">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      In-Person Visit
                    </div>
                  </SelectItem>
                  <SelectItem value="video_call">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Video Call
                    </div>
                  </SelectItem>
                  <SelectItem value="phone_call">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address (only for in-person appointments) */}
        {selectedType === "in_person" && (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter the address where appointments will take place"
                    className="min-h-[80px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting 
              ? "Creating..." 
              : isEditing 
                ? "Update Weekly Slot" 
                : "Create Weekly Slot"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}