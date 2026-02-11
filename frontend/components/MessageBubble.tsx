import { Message } from '@/types/chat'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  const getAgentInfo = () => {
    switch (message.agentType) {
      case 'support':
        return { emoji: '🎧', name: 'Support Agent', gradient: 'from-blue-500 to-indigo-500' }
      case 'order':
        return { emoji: '📦', name: 'Order Agent', gradient: 'from-purple-500 to-pink-500' }
      case 'billing':
        return { emoji: '💳', name: 'Billing Agent', gradient: 'from-emerald-500 to-teal-500' }
      default:
        return { emoji: '🤖', name: 'AI Assistant', gradient: 'from-gray-500 to-gray-600' }
    }
  }

  const agentInfo = getAgentInfo()

  return (
    <div className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[75%] group`}>
        {!isUser && message.agentType && (
          <div className="flex items-center gap-2 mb-3 ml-2">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${agentInfo.gradient} flex items-center justify-center text-sm shadow-lg`}>
              {agentInfo.emoji}
            </div>
            <span className="text-sm font-bold bg-gradient-to-r ${agentInfo.gradient} bg-clip-text text-transparent">{agentInfo.name}</span>
          </div>
        )}
        <div className={isUser
          ? 'text-white px-6 py-4 rounded-3xl rounded-br-md shadow-xl hover:shadow-2xl transition-shadow duration-200'
          : 'bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-4 rounded-3xl rounded-bl-md shadow-xl hover:shadow-2xl border-2 border-[#e5eaf3] transition-shadow duration-200'
        } style={isUser ? { background: 'linear-gradient(135deg, #5b74e8 0%, #6b7bf2 100%)' } : undefined}>
          <div className={`text-base whitespace-pre-wrap leading-relaxed`}>{message.content}</div>
          <div className={`text-xs mt-2 ${isUser ? 'text-indigo-100' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  )
}