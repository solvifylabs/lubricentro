import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface WhatsAppButtonProps {
  phone: string
  message?: string
  label?: string
}

export function WhatsAppButton({ phone, message, label = "WhatsApp" }: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/\D/g, "")
  const encodedMsg = message ? encodeURIComponent(message) : ""
  const url = `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`

  return (
    <Button asChild variant="outline" className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-400/30 dark:hover:bg-yellow-400/10">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  )
}
