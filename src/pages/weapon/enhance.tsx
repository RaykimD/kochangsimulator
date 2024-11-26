import { useState } from 'react';
import { useRouter } from 'next/router';

// 타입 정의
interface Weapon {
    id: string;
    type: string;
    enhancement: number;
    createdAt: number;
}

interface EnhanceSlots {
    weapon: Weapon | null;
    stone: { type: string } | null;
    result: Weapon | null;
}

interface Stats {
    totalAttempts: number;
    successes: number;
    failures: number;
    destroys: number;
    maxEnhance: number;
}

interface UsedResources {
    stones: number;
    advancedStones: number;
    supremeStones: number;
    iron: number;
    blackIron: number;
    specialIron: number;
    lapis: number;
    money: number;
    failedAttempts: number;
}

interface StoneInventory {
    type: 'normal' | 'advanced' | 'supreme';
    count: number;
}

// 강화 확률 테이블
const ENHANCEMENT_RATES = {
    0: { success: 95, destroy: 0, degrade: 2.5 },
    1: { success: 85, destroy: 0, degrade: 7.5 },
    2: { success: 75, destroy: 0, degrade: 12.5 },
    3: { success: 65, destroy: 0, degrade: 17.5 },
    4: { success: 55, destroy: 0, degrade: 22.5 },
    5: { success: 45, destroy: 38.5, degrade: 16.5 },
    6: { success: 35, destroy: 45.5, degrade: 19.5 },
    7: { success: 25, destroy: 52.5, degrade: 22.5 },
    8: { success: 15, destroy: 59.5, degrade: 25.5 },
    9: { success: 10, destroy: 63, degrade: 27 },
    10: { success: 5, destroy: 66.5, degrade: 28.5 },
    11: { success: 5, destroy: 66.5, degrade: 28.5 }
};

// 유틸리티 함수들
const getWeaponName = (type: string) => {
    const names = {
        bow: '활',
        sword: '검',
        spear: '창',
        dagger: '단검',
        fan: '부채'
    };
    return names[type] || type;
};

const getNextEnhanceInfo = (currentEnhance: number) => {
    const rate = ENHANCEMENT_RATES[currentEnhance];
    return `성공률: ${rate.success}%`;
};
const WeaponItem = ({ item, onDragStart }: { item: Weapon; onDragStart: any }) => {
    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer?.setData('text/plain', JSON.stringify(item));
                e.dataTransfer?.setData('itemType', 'weapon');
            }}
            className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center cursor-move relative group"
        >
            <span className="text-white">{getWeaponName(item.type)}</span>
            {item.enhancement > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">
                    +{item.enhancement}
                </span>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-80 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                +{item.enhancement}강 {getWeaponName(item.type)}
                <br />
                {item.enhancement < 12 && getNextEnhanceInfo(item.enhancement)}
            </div>
        </div>
    );
};

const StoneItem = ({ type, count, onDragStart }: { type: 'normal' | 'advanced' | 'supreme'; count: number; onDragStart: any }) => {
    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer?.setData('text/plain', JSON.stringify({ type, count }));
                e.dataTransfer?.setData('itemType', 'stone');
            }}
            className="w-16 h-16 bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-move relative group"
        >
            <span className="text-white text-sm">{
                type === 'normal' ? '일반' :
                    type === 'advanced' ? '상급' : '고급'
            } 강화석</span>
            <span className="text-blue-400 text-xs">({count}개)</span>
            <div className="absolute inset-0 bg-black bg-opacity-80 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                {type === 'normal' ? '기본 강화석' :
                    type === 'advanced' ? '성공률 +5%' : '성공률 +10%'}
            </div>
        </div>
    );
};

const DropZone = ({ item, onDrop, label, type = 'any' }: { item: any; onDrop: (e: any) => void; label: string; type?: 'weapon' | 'stone' | 'any' }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedItemType = e.dataTransfer?.getData('itemType');
        if (type === 'any' || type === draggedItemType) {
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const itemType = e.dataTransfer?.getData('itemType');

        if (type !== 'any' && type !== itemType) {
            return;
        }

        onDrop(e);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="h-32 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center relative"
        >
            {item ? (
                'type' in item && 'count' in item ? (
                    <StoneItem type={item.type} count={1} onDragStart={() => { }} />
                ) : (
                    <WeaponItem item={item} onDragStart={() => { }} />
                )
            ) : (
                <span className="text-gray-400">{label}</span>
            )}
        </div>
    );
};

export default function WeaponEnhance() {
    const router = useRouter();
    const { type } = router.query;

    const [enhanceSlots, setEnhanceSlots] = useState<EnhanceSlots>({
        weapon: null,
        stone: null,
        result: null
    });

    const [inventory, setInventory] = useState<Weapon[]>([]);
    const [stoneInventory, setStoneInventory] = useState<StoneInventory[]>([]);

    const [stats, setStats] = useState<Stats>({
        totalAttempts: 0,
        successes: 0,
        failures: 0,
        destroys: 0,
        maxEnhance: 0
    });

    const [usedResources, setUsedResources] = useState<UsedResources>({
        stones: 0,
        advancedStones: 0,
        supremeStones: 0,
        iron: 0,
        blackIron: 0,
        specialIron: 0,
        lapis: 0,
        money: 0,
        failedAttempts: 0
    });

    // 무기 구매
    const purchaseWeapon = () => {
        const newWeapon: Weapon = {
            id: `${type}_${Date.now()}`,
            type: type as string,
            enhancement: 0,
            createdAt: Date.now()
        };
        setInventory([...inventory, newWeapon]);
        setUsedResources(prev => ({
            ...prev,
            money: prev.money + 1000
        }));
    };

    // 강화석 제작
    const createStone = (stoneType: 'normal' | 'advanced' | 'supreme') => {
        const costs = {
            normal: {
                iron: 3,
                blackIron: 1,
                specialIron: 1,
                lapis: 5,
                money: 5000,
                success: 0.8
            },
            advanced: {
                money: 10000,
                success: 1
            },
            supreme: {
                money: 20000,
                success: 1
            }
        };

        const cost = costs[stoneType];
        const roll = Math.random();

        if (stoneType === 'normal') {
            setUsedResources(prev => ({
                ...prev,
                iron: prev.iron + cost.iron,
                blackIron: prev.blackIron + cost.blackIron,
                specialIron: prev.specialIron + cost.specialIron,
                lapis: prev.lapis + cost.lapis,
                money: prev.money + cost.money
            }));

            if (roll <= cost.success) {
                setStoneInventory(prev => {
                    const existingStone = prev.find(s => s.type === 'normal');
                    if (existingStone) {
                        return prev.map(s =>
                            s.type === 'normal'
                                ? { ...s, count: s.count + 1 }
                                : s
                        );
                    }
                    return [...prev, { type: 'normal', count: 1 }];
                });
            } else {
                setUsedResources(prev => ({
                    ...prev,
                    failedAttempts: prev.failedAttempts + 1
                }));
            }
        } else {
            const normalStone = stoneInventory.find(s => s.type === 'normal');
            if (normalStone?.count >= 1) {
                setStoneInventory(prev => {
                    const updated = prev.map(s => {
                        if (s.type === 'normal') return { ...s, count: s.count - 1 };
                        if (s.type === stoneType) return { ...s, count: (s.count || 0) + 1 };
                        return s;
                    }).filter(s => s.count > 0);

                    if (!updated.some(s => s.type === stoneType)) {
                        updated.push({ type: stoneType, count: 1 });
                    }
                    return updated;
                });
                setUsedResources(prev => ({
                    ...prev,
                    money: prev.money + cost.money
                }));
            }
        }
    };

    // 강화
    const enhance = () => {
        if (!enhanceSlots.weapon || !enhanceSlots.stone) return;

        const weapon = enhanceSlots.weapon;
        const stoneType = enhanceSlots.stone.type as 'normal' | 'advanced' | 'supreme';
        const stone = stoneInventory.find(s => s.type === stoneType);

        if (!stone || stone.count <= 0) return;

        const rates = ENHANCEMENT_RATES[weapon.enhancement];
        let successRate = rates.success;

        if (stoneType === 'advanced') successRate += 5;
        if (stoneType === 'supreme') successRate += 10;

        setStoneInventory(prev =>
            prev.map(s =>
                s.type === stoneType
                    ? { ...s, count: s.count - 1 }
                    : s
            ).filter(s => s.count > 0)
        );

        const roll = Math.random() * 100;
        setStats(prev => ({
            ...prev,
            totalAttempts: prev.totalAttempts + 1
        }));

        if (roll < successRate) {
            const newEnhancement = weapon.enhancement + 1;
            const enhancedWeapon = {
                ...weapon,
                enhancement: newEnhancement
            };
            setEnhanceSlots(prev => ({
                ...prev,
                result: enhancedWeapon
            }));
            setStats(prev => ({
                ...prev,
                successes: prev.successes + 1,
                maxEnhance: Math.max(prev.maxEnhance, newEnhancement)
            }));
        } else {
            const destroyRoll = Math.random() * 100;
            if (weapon.enhancement >= 5 && destroyRoll < rates.destroy) {
                setEnhanceSlots({ weapon: null, stone: null, result: null });
                setStats(prev => ({
                    ...prev,
                    destroys: prev.destroys + 1
                }));
            } else if (destroyRoll < (rates.destroy + rates.degrade)) {
                const degradedWeapon = {
                    ...weapon,
                    enhancement: Math.max(0, weapon.enhancement - 1)
                };
                setEnhanceSlots(prev => ({
                    ...prev,
                    result: degradedWeapon
                }));
                setStats(prev => ({
                    ...prev,
                    failures: prev.failures + 1
                }));
            } else {
                setEnhanceSlots(prev => ({
                    ...prev,
                    result: weapon
                }));
                setStats(prev => ({
                    ...prev,
                    failures: prev.failures + 1
                }));
            }
        }

        setUsedResources(prev => ({
            ...prev,
            [`${stoneType}Stones`]: prev[`${stoneType}Stones`] + 1
        }));
    };

    // 드래그 앤 드롭 핸들러
    const handleDragStart = (e: DragEvent, item: any) => {
        if ('type' in item && ('count' in item)) { // 강화석인 경우
            e.dataTransfer?.setData('text/plain', JSON.stringify(item));
            e.dataTransfer?.setData('itemType', 'stone');
        } else { // 무기인 경우
            e.dataTransfer?.setData('text/plain', JSON.stringify(item));
            e.dataTransfer?.setData('itemType', 'weapon');
        }
    };

    const handleWeaponDrop = (e: DragEvent) => {
        e.preventDefault();

        const itemType = e.dataTransfer?.getData('itemType');
        if (itemType !== 'weapon') return; // 무기가 아닌 경우 무시

        try {
            const weaponData = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');

            // 기존 무기가 있다면 인벤토리로 반환
            if (enhanceSlots.weapon) {
                setInventory(prev => [...prev, enhanceSlots.weapon!]);
            }

            // 새 무기 설정
            setEnhanceSlots(prev => ({ ...prev, weapon: weaponData }));

            // 인벤토리에서 해당 무기 제거
            setInventory(prev => prev.filter(w => w.id !== weaponData.id));
        } catch (error) {
            console.error('Weapon drop error:', error);
        }
    };

    const handleStoneDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!enhanceSlots.weapon) return;

        const itemType = e.dataTransfer?.getData('itemType');
        if (itemType !== 'stone') return;

        try {
            const stoneData = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');

            // 기존 강화석이 있다면 인벤토리로 반환
            if (enhanceSlots.stone) {
                setStoneInventory(prev => {
                    const existingStone = prev.find(s => s.type === enhanceSlots.stone?.type);
                    if (existingStone) {
                        return prev.map(s =>
                            s.type === enhanceSlots.stone?.type
                                ? { ...s, count: s.count + 1 }
                                : s
                        );
                    }
                    return [...prev, { type: enhanceSlots.stone?.type as any, count: 1 }];
                });
            }

            // 새 강화석 설정
            setEnhanceSlots(prev => ({ ...prev, stone: { type: stoneData.type } }));

            // 인벤토리에서 강화석 감소
            setStoneInventory(prev => {
                return prev.map(s =>
                    s.type === stoneData.type
                        ? { ...s, count: s.count - 1 }
                        : s
                ).filter(s => s.count > 0);
            });
        } catch (error) {
            console.error('Stone drop error:', error);
        }
    };

    // 결과 수집
    const collectResult = () => {
        if (enhanceSlots.result) {
            setInventory(prev => [...prev, enhanceSlots.result!]);
            setEnhanceSlots({ weapon: null, stone: null, result: null });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
            <div className="max-w-7xl mx-auto">
                {/* 상단 네비게이션 */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.push('/weapon')}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        ← 무기 선택으로 돌아가기
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('모든 진행 상황이 초기화됩니다. 계속하시겠습니까?')) {
                                router.push('/')
                            }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                        초기화
                    </button>
                </div>

                {/* 메인 컨텐츠 영역 */}
                <div className="flex gap-6">
                    {/* 왼쪽 섹션 - 65% */}
                    <div className="w-[65%] space-y-6">
                        {/* 강화 UI */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">무기 강화</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <DropZone
                                    item={enhanceSlots.weapon}
                                    onDrop={handleWeaponDrop}
                                    label="무기를 드래그하세요"
                                    type="weapon"
                                />
                                <DropZone
                                    item={enhanceSlots.stone}
                                    onDrop={handleStoneDrop}
                                    label="강화석을 드래그하세요"
                                    type="stone"
                                />
                                <div className="relative">
                                    <DropZone
                                        item={enhanceSlots.result}
                                        onDrop={() => { }}
                                        label="성공 시 결과"
                                        type="any"
                                    />
                                    {enhanceSlots.result && (
                                        <button
                                            onClick={collectResult}
                                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-1 rounded-full text-sm transition-colors duration-200"
                                        >
                                            수집
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={enhance}
                                disabled={!enhanceSlots.weapon || !enhanceSlots.stone}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg py-2 transition-colors duration-200"
                            >
                                강화하기
                            </button>
                        </div>

                        {/* 인벤토리 */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">인벤토리</h2>
                            <div className="space-y-4">
                                {/* 무기 인벤토리 */}
                                <div className="grid grid-cols-8 gap-2">
                                    {inventory.map((item) => (
                                        <WeaponItem
                                            key={item.id}
                                            item={item}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </div>

                                {/* 강화석 인벤토리 */}
                                <div className="grid grid-cols-8 gap-2 border-t border-gray-700 pt-4">
                                    {stoneInventory.map((stone) => (
                                        <StoneItem
                                            key={stone.type}
                                            type={stone.type}
                                            count={stone.count}
                                            onDragStart={handleDragStart}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 사용된 재화 */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">사용된 재화</h2>
                            <div className="space-y-2 text-gray-300">
                                <div className="space-y-1">
                                    <p>강화석 사용: {usedResources.stones}개</p>
                                    <p>상급 강화석: {usedResources.advancedStones}개</p>
                                    <p>고급 강화석: {usedResources.supremeStones}개</p>
                                </div>
                                <div className="space-y-1 mt-4">
                                    <p>소모된 재료:</p>
                                    <p className="ml-4">철: {usedResources.iron}개</p>
                                    <p className="ml-4">묵철: {usedResources.blackIron}개</p>
                                    <p className="ml-4">오철: {usedResources.specialIron}개</p>
                                    <p className="ml-4">청금석: {usedResources.lapis}개</p>
                                </div>
                                <div className="mt-4">
                                    <p>강화석 제작 실패: {usedResources.failedAttempts}회</p>
                                    <p>총 사용 금액: {usedResources.money.toLocaleString()}원</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 섹션 - 35% */}
                    <div className="w-[35%] space-y-6">
                        {/* 무기 구매 */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">무기 구매</h2>
                            <button
                                onClick={purchaseWeapon}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 transition-colors duration-200"
                            >
                                무기 구매 (1,000원)
                            </button>
                        </div>

                        {/* 강화석 제작 */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">강화석 제작</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => createStone('normal')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors duration-200"
                                >
                                    일반 강화석 제작 ({stoneInventory.find(s => s.type === 'normal')?.count || 0})
                                </button>
                                <button
                                    onClick={() => createStone('advanced')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors duration-200"
                                >
                                    상급 강화석 제작 ({stoneInventory.find(s => s.type === 'advanced')?.count || 0})
                                </button>
                                <button
                                    onClick={() => createStone('supreme')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 transition-colors duration-200"
                                >
                                    고급 강화석 제작 ({stoneInventory.find(s => s.type === 'supreme')?.count || 0})
                                </button>
                            </div>
                        </div>

                        {/* 강화 통계 */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">강화 통계</h2>
                            <div className="space-y-2 text-gray-300">
                                <p>총 시도: {stats.totalAttempts}회</p>
                                <p>성공: {stats.successes}회</p>
                                <p>실패: {stats.failures}회</p>
                                <p>파괴: {stats.destroys}회</p>
                                <p>최고 강화: +{stats.maxEnhance}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}