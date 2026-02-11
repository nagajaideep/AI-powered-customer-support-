import { Request, Response } from 'express'
import { agentService } from '../services/agent.service'

export const agentController = {
  async getAgents(req: Request, res: Response) {
    try {
      const agents = await agentService.listAgents()
      res.json(agents)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agents' })
    }
  },

  async getAgentCapabilities(req: Request, res: Response) {
    try {
      const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type
      const capabilities = await agentService.getAgentCapabilities(type)
      res.json(capabilities)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agent capabilities' })
    }
  }
}