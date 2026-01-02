import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, CheckCircle } from "lucide-react"

const timeSlots = [
  "9:00 AM - 9:30 AM",
  "9:30 AM - 10:00 AM", 
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM",
  "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM",
  "3:00 PM - 3:30 PM",
  "3:30 PM - 4:00 PM"
]

const demoFeatures = [
  "Complete platform overview",
  "Customized workflow demonstration", 
  "Q&A with product experts",
  "Pricing and licensing discussion",
  "Implementation timeline",
  "Technical requirements review"
]

export default function Demo() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Calendar className="w-16 h-16 text-indigo-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              Schedule Your Demo
            </h1>
            
            <p className="text-xl text-zinc-400 mb-8">
              See how KiTS Hub can transform your business operations with a personalized demonstration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">
                What&apos;s Included
              </h2>
              
              <div className="space-y-4 mb-8">
                {demoFeatures.map((feature) => (
                  <div key={feature} className="flex items-start text-zinc-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="bg-zinc-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Demo Details
                </h3>
                <div className="space-y-3 text-zinc-400">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-indigo-400" />
                    <span>Duration: 30 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-indigo-400" />
                    <span>Format: Video conference</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-indigo-400" />
                    <span>Availability: Weekdays 9AM - 4PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-zinc-900 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Book Your Time Slot
                </h2>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter your work email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Preferred Time
                    </label>
                    <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                      <option value="">Select a time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      What would you like to see? (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
                      rows={4}
                      placeholder="Tell us about your specific needs and interests..."
                    />
                  </div>
                  
                  <Button className="w-full rounded-full">
                    Schedule Demo
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
