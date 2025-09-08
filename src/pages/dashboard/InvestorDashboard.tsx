import type React from "react"
import { CircleDollarSign, TrendingUp, Building2, FileText, Target } from "lucide-react"
import { Card, CardHeader, CardBody } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"

export const InvestorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <CircleDollarSign className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
                <p className="text-sm text-gray-600">Track your portfolio and discover new opportunities</p>
              </div>
            </div>
            <Button>Browse Startups</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                  <p className="text-2xl font-semibold text-gray-900">$15.2M</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Investments</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Deal Pipeline</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white">
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ROI Average</p>
                  <p className="text-2xl font-semibold text-gray-900">23.5%</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white">
            <CardHeader className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Performing Investments</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">TechWave AI</p>
                      <p className="text-xs text-gray-500">Series A • $2M invested</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+45.2%</p>
                    <p className="text-xs text-gray-500">$2.9M value</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">GreenTech Solutions</p>
                      <p className="text-xs text-gray-500">Seed • $500K invested</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+32.1%</p>
                    <p className="text-xs text-gray-500">$660K value</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white">
            <CardHeader className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Deal Flow</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">FinTech Startup - Series B</p>
                    <p className="text-xs text-gray-500">$5M round • Due diligence</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">HealthTech Platform</p>
                    <p className="text-xs text-gray-500">$1.2M seed • Pitch scheduled</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
