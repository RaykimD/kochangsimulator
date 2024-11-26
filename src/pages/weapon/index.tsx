import { useRouter } from 'next/router'

export default function WeaponSelect() {
  const router = useRouter()

  const weapons = [
    { id: 'bow', name: '활', description: '0강 ~ 12강까지 강화 가능' },
    { id: 'sword', name: '칼', description: '0강 ~ 12강까지 강화 가능' },
    { id: 'spear', name: '창', description: '0강 ~ 12강까지 강화 가능' },
    { id: 'dagger', name: '단검', description: '0강 ~ 12강까지 강화 가능' },
    { id: 'fan', name: '부채', description: '0강 ~ 12강까지 강화 가능' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto pt-10">
        <button 
          onClick={() => router.push('/')}
          className="mb-8 text-gray-400 hover:text-white transition-colors duration-200"
        >
          ← 메인으로 돌아가기
        </button>

        <h1 className="text-4xl font-bold text-center mb-2 text-white animate-fade-in-down">
          무기 선택
        </h1>
        <p className="text-center text-gray-400 mb-12 animate-fade-in">
          강화하고 싶은 무기를 선택하세요
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {weapons.map((weapon) => (
            <button
              key={weapon.id}
              onClick={() => router.push(`/weapon/enhance?type=${weapon.id}`)}
              className="group relative overflow-hidden p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-700 hover:border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"/>
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-600 transition-colors duration-300">
                <span className="text-3xl text-gray-400 group-hover:text-white">
                  {weapon.name[0]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 relative z-10">
                {weapon.name}
              </h2>
              <p className="text-sm text-gray-400 relative z-10">
                {weapon.description}
              </p>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-blue-400">선택하기 →</span>
              </div>
            </button>
          ))}
        </div>
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