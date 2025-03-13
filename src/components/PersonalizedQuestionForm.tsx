
import { useState } from "react";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SparklesIcon } from "lucide-react";
import GeminiService from "../services/GeminiService";
import { toast } from "sonner";

const formSchema = z.object({
  question: z.string().min(10, {
    message: "Your question must be at least 10 characters.",
  }).max(500, {
    message: "Your question must not exceed 500 characters."
  }),
});

interface PersonalizedQuestionFormProps {
  palmImageUrl: string;
  readingId: string;
}

const PersonalizedQuestionForm = ({ palmImageUrl, readingId }: PersonalizedQuestionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setResponse(null);
      
      const prompt = `
        As an expert palm reader looking at this palm image (${palmImageUrl}), please provide a detailed, personalized answer to the following question:
        
        "${values.question}"
        
        Base your answer on traditional palm reading principles, focusing on the major lines (life, heart, head), mounts, and other palm features. Maintain a respectful, insightful tone and provide specific details that would be meaningful to someone seeking guidance.
        
        Reading ID for reference: ${readingId}
      `;
      
      const answer = await GeminiService.generateTextWithGemini(prompt);
      setResponse(answer);
      form.reset();
      
      toast.success("Your personalized reading is ready!", {
        description: "We've analyzed your question and provided insights based on your palm."
      });
    } catch (error) {
      console.error("Error generating personalized reading:", error);
      toast.error("Failed to generate personalized reading", {
        description: "Please try again later or contact support if the problem persists."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <SparklesIcon size={24} className="mr-2 text-palm-purple" />
        Personalized Reading Request
      </h2>
      
      <p className="text-gray-600 mb-6">
        Have a specific question about your future, career, love life, or any other aspect you'd like guidance on? 
        Submit your question below for a detailed analysis based on your palm reading.
      </p>
      
      {!response ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Will I find success in my new career path? What does my palm say about my love life?" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific with your question for the most accurate personalized insights.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-palm-purple hover:bg-purple-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Palm...
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Get Personalized Insights
                </>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line text-gray-700">{response}</p>
            </div>
          </div>
          
          <Button
            onClick={() => setResponse(null)}
            variant="outline"
            className="w-full"
          >
            Ask Another Question
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonalizedQuestionForm;
