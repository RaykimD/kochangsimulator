import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  const categories = [
    { id: 'weapon', name: '무기 강화', description: '무기 강화 및 제작' },
    { id: 'armor', name: '방어구', description: '방어구 주문서 작 / 재련 / 잠재능력' },
    { id: 'talisman', name: '부적 강화', description: '고급/희귀 부적 강화' },
    { id: 'ring', name: '반지/경공비급', description: '반지 및 경공비급 강화' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-5xl font-bold text-center mb-2 text-white animate-fade-in-down">
          코창서버 강화 시뮬레이터
        </h1>
        <p className="text-center text-gray-400 mb-12 animate-fade-in">
          원하는 아이템을 선택하여 강화를 시작해보세요
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(`/${category.id}`)}
              className="group relative overflow-hidden p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-700 hover:border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"/>
              <h2 className="text-xl font-bold text-white mb-2 relative z-10">
                {category.name}
              </h2>
              <p className="text-sm text-gray-400 relative z-10">
                {category.description}
              </p>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-blue-400">선택하기 →</span>
              </div>
            </button>
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm space-y-2">
          <p className="text-gray-400">
            이 사이트는 수익창출 목적이 아니며 팬심으로 만든 것이기 때문에 부족하더라도 양해 바랍니다.
          </p>
          <p>© 2024 코창서버 강화 시뮬레이터</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}