# 설탕은 녹는다 — 이미지·BGM 가이드
**기반 문서**: story_20260712_동화스릴러.md / quiz_20260712.md
**작성**: 이미지 에이전트, 2026-07-12

## 1. 아트 디렉션

**콘셉트 한 줄**: 따뜻한 동화 그림책의 표면 — 그리고 그 아래에서 배어 나오는 스산함. 과하게 "호러"로 가지 않는다. 모든 컷은 1차 시선에서 아늑하고, 3초 뒤에 어딘가 이상해야 한다.

### 1-1. 스타일 고정값 (전 컷 공통)
- **화풍**: 구아슈+색연필 질감의 클래식 동화 삽화 (유럽 그림책, 19세기 말 판화 삽화의 구도감). 3D·포토리얼 금지.
- **불안 요소 주입법**: 색·구도·소품으로만. (지나치게 대칭적인 아늑함, 살짝 긴 그림자, 유리·설탕의 과도한 반짝임, 인물 없는 의자 등) 혈흔·괴물·직접적 공포 이미지 절대 금지.
- **영문 스타일 토큰 `STYLE_CORE`** (모든 프롬프트 앞에 반복):
  `classic storybook illustration, gouache and colored pencil texture, painterly European fairytale picture-book style, warm cozy surface with a subtle undercurrent of unease, soft volumetric light, rich intricate detail, muted cinematic color grading, no text, no watermark`
- **공통 부정 프롬프트 `NEG_CORE`**:
  `photorealistic, 3d render, cgi, anime, horror gore, blood, monsters, creepy faces, text, letters, watermark, logo, oversaturated neon colors, modern objects, electric lights, plastic`

### 1-2. 색 팔레트 (HEX)
**A. 전반부 — 캐러멜·크림 (Ch1~6, 방 배경 기본)**
| 역할 | 색 | HEX |
|---|---|---|
| 베이스(벽·빛) | 프로스팅 크림 | `#F6E7C9` |
| 주조 | 캐러멜 | `#C9803D` |
| 보조 | 진저브레드 브라운 | `#8A5A2B` |
| 포인트 온기 | 계피 레드 | `#A84A2A` |
| 포인트 광원 | 벌꿀 골드 | `#E8B04B` |
| 차색 악센트(소량) | 서리 민트 | `#9FCFBE` |

**B. 후반부 — 재·청회색 (Ch7~8, 우물 지하·심화 구간)**
| 역할 | 색 | HEX |
|---|---|---|
| 베이스 | 재 회색 | `#4B4A46` |
| 주조 | 청회색 | `#5B6B78` |
| 보조 | 탈색 크림 | `#D8D2C2` |
| 그림자 | 숯 흑 | `#232220` |
| 잔불 악센트(극소량) | 꺼진 불씨 | `#B0533A` |

**C. 그날 밤 모드 (Ch9 오버레이)**
| 역할 | 색 | HEX |
|---|---|---|
| 전체 틴트 | 달빛 청 | `#7FA3BF` |
| 잔상 실루엣 | 창백한 얼음 | `#CBD8E0` |
| 어둠 | 심야 남 | `#1C2530` |

- **팔레트 운용 규칙**: Ch1→Ch8로 갈수록 A 비중을 줄이고 B를 늘린다. 같은 방이라도 재방문 챕터가 뒤일수록 채도 -10%씩. 그날 밤 모드는 A/B 위에 C 틴트를 70% 덮고 잔상만 `#CBD8E0` 발광.

### 1-3. 조명
- 전반부: 벽난로·촛불·오븐 등 **낮은 곳의 따뜻한 점광원** + 창밖 겨울 산광. 그림자는 부드럽지만 실제보다 10% 길게.
- 후반부: 위에서 꽂히는 **차가운 사선광**(채광창·우물 입구). 점광원은 거의 없음.
- 그날 밤: 달빛 단일광 + 잔상 자체 발광. 광원 색温 4000K→2200K(과거 장면 화염 잔재)만 예외적 온기.

### 1-4. 질감
- 설탕 코팅: 굵은 입자 반짝임(글리터 금지, 서리 결정 느낌). 벽 모서리마다 흘러 굳은 드립.
- 생강빵·목재: 마른 붓 터치, 종이 결 노출.
- 후반부: 설탕 반짝임이 사라지고 재 먼지·무광 질감으로 교체. "반짝임의 소멸"이 곧 진행도 표시다.

## 2. 캐릭터 시트 (스포일러 비노출 고정값)

> 배경 컷은 빈 방 원칙이므로 캐릭터는 **대화 카드/실루엣/엔딩 컷**에만 등장한다. 아래 고정값을 모든 등장 컷 프롬프트에 반복한다.

### 2-1. 관리인 할미 (정체: 노년의 그레텔 — 절대 시각적 암시 금지)
- 외형: 80대 초반, 작고 단단한 체구, 굽었지만 손끝이 정확한 손. 눈은 흐리지만 시선이 오래 머무는 버릇.
- 의상: 크림색 숄 + 캐러멜 브라운 원피스, 허리에 낡은 열쇠 꾸러미(장식용으로 보임), 앞치마에 설탕 가루.
- 표정 고정값: 온화한 미소가 기본. 단 "부엌·가마" 화제에서만 0.5초 멈추는 정지감 — 표정 자체는 바꾸지 않는다.
- 금지: 젊은 시절 회상 컷, 그레텔을 연상시키는 소품(빨간 리본, 빵부스러기 주머니) 노출 금지.
- 영문 토큰: `a small sturdy old woman in her early 80s, cream shawl over caramel-brown dress, old key ring at her waist, flour and sugar dust on apron, gentle unreadable smile, kind weathered face`

### 2-2. 정원사 (정체: 노년의 헨젤 — 침묵, 항상 원경)
- 외형: 80대 중반, 마르고 큰 키, 구부정. 항상 뒷모습 또는 원경 실루엣. 얼굴 클로즈업 금지.
- 의상: 재 회색 코트, 낡은 가죽 장갑, 목에 하얀 새 깃털 하나가 꽂힌 모자.
- 행동 고정값: 말하지 않는다. 흙을 만지거나, 모이대를 채우거나, 멀리서 이쪽을 본다.
- 영문 토큰: `a tall thin elderly gardener seen from behind or at a distance, ash-grey coat, worn leather gloves, hat with a single white feather, silent solitary presence`

### 2-3. 하얀 새
- 외형: 흰 비둘기보다 약간 큰 무명(無名)의 새. 깃털 끝만 서리 민트 `#9FCFBE` 기운.
- 역할: 챕터 전환·크로스룸 트리거의 시각 신호. 항상 창밖·모이대·처마 등 "경계"에만 앉는다. 방 안으로 들어오지 않는다(그날 밤 모드 제외).
- 영문 토큰: `a white bird slightly larger than a dove, feather tips tinged pale mint, perched at windowsills and eaves, calm watchful`

## 3. 공간 시트 (8개 방 + 그날 밤 모드)

**공통 카메라 규칙**: 방 배경은 전부 16:9, 시선 높이 140cm(검증관 눈높이), 광각 왜곡 금지. 인물은 배경 컷에 넣지 않는다(빈 방 원칙 — "방금까지 누가 있던 것 같은" 공기만 남긴다).

### 3-1. 응접실 (허브)
- **조명**: 벽난로 하단 점광(벌꿀 골드 `#E8B04B`) + 창밖 겨울 산광. 그림자 10% 길게.
- **색감**: 팔레트 A 최대치. 프로스팅 크림 벽 + 캐러멜 목재.
- **카메라**: 현관에서 본 아이레벨 와이드. 벽난로 중좌, 남쪽 벽이 화면 우측.
- **핵심 오브젝트 고정값**: 벽난로, 방명록 스탠드, 동화 삽화 액자 6점(내용 판독 불가 수준으로 작게), 창가 새 모이대, 빈 안락의자 2개, 남쪽 벽(설탕 코팅이 유난히 두껍고 반짝임 — 균열·자국은 절대 노출 금지).
- **그날 밤**: 설탕 벗겨진 생나무 벽 + 도끼 자국 9개, 그 앞에 선 마을 사람들의 `#CBD8E0` 잔상 실루엣.

### 3-2. 과자 부엌
- **조명**: 오븐 아궁이 하단 화광 + 선반 촛불. 천장은 어둡게.
- **색감**: 팔레트 A + 계피 레드 `#A84A2A` 포인트.
- **카메라**: 살짝 로우앵글, 검은 무쇠 오븐 정면(전시물의 위압감).
- **핵심 오브젝트 고정값**: 전시용 무쇠 오븐(부자연스럽게 새것·광택), 안내판, 레시피 카드 액자, 덤웨이터 해치, 개수대, 생강빵 선반. 바닥 틈 그을음은 초반 컷에서 식별 불가 수준(§5 참조).
- **그날 밤**: 오븐이 사라지고 빈 자리만. 바닥 틈에서 올라오는 그을음 자국이 또렷해짐.

### 3-3. 식료품 저장고
- **조명**: 촛대 1개 + 문틈 사선광, 밀가루 먼지 부유.
- **색감**: 팔레트 A 저채도 버전(크림→회갈색으로 한 단계 눌림).
- **카메라**: 짧은 계단 위에서 내려다보는 하이 아이레벨, 항아리 선반이 소실점으로.
- **핵심 오브젝트 고정값**: 대저울, 항아리 수십 개, 장부 선반(반쪽 티 안 나게), 씨앗 단지, 매달린 마른 허브.
- **그날 밤**: 선반이 절반 비어 있고, 식량 자루를 나르는 손들의 잔상.

### 3-4. 설탕 온실 + 정원
- **조명**: 유리 너머 겨울 확산광, 서리 낀 유리의 프리즘 반짝임.
- **색감**: 팔레트 A + 서리 민트 `#9FCFBE`를 이 방에서만 넉넉히.
- **카메라**: 온실 입구에서 정원 쪽으로 관통하는 와이드. 해시계가 중경, 겨울 숲이 원경.
- **핵심 오브젝트 고정값**: 설탕 장미 화단, 새장, 모이통, 해시계, 조약돌 오솔길, 정원사의 흙 묻은 장갑(구석에 소품으로). 화단 아래 주머니는 절대 노출 금지.
- **그날 밤**: 유리 성에가 안쪽에서 밖으로 긁혀 있고, 새 떼 잔상이 마을 방향으로 날아가는 선.

### 3-5. 아이들의 방
- **조명**: 장난감 선반 쪽 온광 + 창 쪽 냉광의 이중 조명(다정함/위화감 공존을 빛으로).
- **색감**: 팔레트 A. 단, 나무 우리 주변만 채도 -15%.
- **카메라**: 문간에서 본 아이레벨. 나무 우리 우측, 키·몸무게 눈금 문틀이 화면 좌측 프레임 역할.
- **핵심 오브젝트 고정값**: 나무 우리(걸쇠 디테일은 그림자 속 — 안쪽 걸쇠 구조 노출 금지), 문틀 눈금, 오르골, 장난감 상자, 작은 침대 2개.
- **그날 밤**: 우리 틈새 안쪽에서 바깥을 보는 시점의 잔상(소년의 눈은 그리지 않고 시선 방향만).

### 3-6. 우물 지하 (Ch7 개방)
- **조명**: 계단 개구부에서 꽂히는 차가운 사선광 단일. 점광원 없음.
- **색감**: **팔레트 B 전면 전환.** 잔불 악센트 `#B0533A`는 가마 잔해 깊숙이 한 점만.
- **카메라**: 계단 하단에서 본 로우 와이드, 낮은 천장의 압박감. 우물 좌측, 무너진 가마 우측.
- **핵심 오브젝트 고정값**: 말라붙은 우물+도르래, 무너진 벽돌 가마(부엌 오븐보다 명백히 큼), 재층 발굴 구역, 설탕 층위 단면(흰 줄무늬 65겹 느낌).
- **그날 밤**: 가마가 온전한 형태로 복원되고, 걸쇠에 얹힌 작은 손의 잔상. 화염 잔재 2200K 온기(§1-3 예외 규정).

### 3-7. 다락 서고
- **조명**: 성에 낀 채광창의 사선광 + 종이 먼지 부유. 팔레트 A→B 전환의 중간톤.
- **색감**: 탈색 크림 `#D8D2C2` 위주, 벌꿀 골드는 책등에만.
- **카메라**: 경사 지붕 보를 프레임으로 쓰는 로우 와이드.
- **핵심 오브젝트 고정값**: 판본 서가(책 7권 구분), 마을 연대기 책상, 채광창+크랭크, 낡은 안경, 성에 낀 유리(글씨는 절대 노출 금지 — T1 전).
- **그날 밤**: 채광창 밖으로 보이는 숲의 붉은 화광(멀리, 작게). 다락 자체는 가장 변화가 적은 방.

### 3-8. 뒷방 (Ch9 개방)
- **조명**: 새벽 청회광 + 촛불 1개. 이 집에서 유일하게 반짝임이 전혀 없는 방.
- **색감**: 무채 목재 + 탈색 크림. 팔레트 A의 설탕 광택 질감 전면 금지.
- **카메라**: 정직한 아이레벨 정면(연출 없는 소박함이 연출).
- **핵심 오브젝트 고정값**: 나무 침대, 유품 상자, 설탕 솔+양동이, 창밖 새 모이대, 못에 걸린 낡은 외투.
- **그날 밤**: 변형 없음 — 이 방은 처음부터 "그날 밤 이후"의 방이다.

### 3-9. 그날 밤 모드 공통 변형 규칙 (Ch9 재방문)
1. 원본 배경 위에 달빛 청 `#7FA3BF` 틴트 70% + 전체 채도 -60%.
2. 설탕 코팅·전시 안내판·전시 소품 제거 → 65년 전 상태(생나무, 살림살이, 빵 굽는 도구) 복원.
3. 잔상 인물은 `#CBD8E0` 자체 발광 실루엣만. 얼굴·표정 묘사 금지, 자세와 손만으로 서사 전달.
4. 광원은 달빛 단일(4000K), 예외는 지하 가마의 화염 잔재(2200K)뿐.
5. 반짝임 입자 완전 제거 — 눈 결정 낙하 파티클로 대체.
## 4. 이미지 생성 프롬프트 (15컷)

**표기 규칙**: 모든 프롬프트는 `[STYLE_CORE] + 본문`으로 생성한다(§1-1 토큰 전문을 실제 생성 시 풀어서 삽입). 부정 프롬프트는 `[NEG_CORE] + 컷별 추가어`. 방 배경·타이틀·엔딩 전부 **16:9**.

### C01. 응접실 (방 배경)
- **프롬프트**: [STYLE_CORE] Interior of a gingerbread cottage parlor, eye-level wide shot from the entrance. A glowing hearth on the center-left casts long honey-gold light across frosting-cream walls (#F6E7C9, #E8B04B), two empty armchairs facing the fire as if someone just left. A guestbook stand, six small framed fairytale illustrations, and a bird feeder by the frosty window. The south wall on the right is coated in an unusually thick, glittering layer of hardened sugar, smooth and unbroken like fresh frost. Overly perfect coziness, shadows slightly longer than natural.
- **부정**: [NEG_CORE], cracks in walls, axe marks, scorch marks, people
- **비율**: 16:9

### C02. 과자 부엌 (방 배경)
- **프롬프트**: [STYLE_CORE] A fairytale bakery kitchen, slight low-angle shot facing a massive black cast-iron oven that looks suspiciously brand new and polished. Warm firelight spills from the oven's mouth onto caramel wood floors (#C9803D, #A84A2A), shelves of gingerbread loaves and candy jars, a museum-style placard beside the oven, a small dumbwaiter hatch in the wall. Candlelight on the shelves, dark ceiling above. Cozy gingerbread scent made visible through warm haze — yet the oven feels staged, like a prop.
- **부정**: [NEG_CORE], soot stains on floor, fire damage, people
- **비율**: 16:9

### C03. 식료품 저장고 (방 배경)
- **프롬프트**: [STYLE_CORE] A cool cellar pantry seen from the top of a short staircase, high eye-level. Dozens of earthenware jars recede toward a vanishing point along wooden shelves, flour dust floating in a single diagonal shaft of light from the door gap, one candlestick burning. A large balance scale, a ledger shelf, a seed jar with a handwritten label, dried herbs hanging from beams. Muted low-saturation cream and grey-brown tones (#F6E7C9 dimmed toward #8A5A2B), quiet and colder than the rest of the house.
- **부정**: [NEG_CORE], empty shelves, people, torches
- **비율**: 16:9

### C04. 설탕 온실 + 정원 (방 배경)
- **프롬프트**: [STYLE_CORE] A winter greenhouse of sugar roses, wide shot piercing from the glass door through to a snowy garden. Diffused winter light through frost-covered panes creating prism sparkles, sugar-crystal roses in flowerbeds (#9FCFBE frost mint accents on cream #F6E7C9), a birdcage and a seed feeder, a stone sundial in the middle distance, a pebble path leading toward the winter forest beyond. A gardener's soil-stained gloves resting forgotten on a corner bench. Serene, glittering, a touch too quiet.
- **부정**: [NEG_CORE], buried pouch, digging marks, people, summer flowers
- **비율**: 16:9

### C05. 아이들의 방 (방 배경)
- **프롬프트**: [STYLE_CORE] A children's bedroom in a fairytale cottage, eye-level from the doorway. Dual lighting: warm candle glow over a toy shelf and music box on the left, cold window light on the right falling across a wooden cage-like crib whose latch is hidden in shadow. Height and weight marks pencilled on the door frame in the left foreground, two small beds, a toy chest. Tender storybook warmth (#F6E7C9, #E8B04B) with the area around the wooden cage subtly desaturated. Sweetness and wrongness in the same frame.
- **부정**: [NEG_CORE], visible latch mechanism, chains, cage bars close-up, children
- **비율**: 16:9

### C06. 우물 지하 (방 배경)
- **프롬프트**: [STYLE_CORE] An underground chamber beneath a cottage, low wide shot from the foot of a stone staircase, oppressive low ceiling. A single cold diagonal shaft of light stabs down from the stair opening into ash-grey and slate-blue darkness (#4B4A46, #5B6B78, #232220). A dried-up well with a pulley on the left, the collapsed remains of a large brick bread kiln on the right, an excavation patch on the floor revealing a cross-section of dozens of thin white sugar strata like tree rings. One faint ember-red glint (#B0533A) deep in the kiln rubble. Archaeological silence.
- **부정**: [NEG_CORE], warm light, candles, sparkling sugar, people, skeletons
- **비율**: 16:9

### C07. 다락 서고 (방 배경)
- **프롬프트**: [STYLE_CORE] A cottage attic archive, low wide shot framed by sloped roof beams. Diagonal light through a frost-covered skylight, paper dust suspended in the beam, bleached-cream tones (#D8D2C2) with honey-gold only on book spines. A bookshelf holding seven distinct editions of the same storybook, a village chronicle open on a writing desk, an old pair of spectacles, a crank mechanism beside the skylight. The frost on the glass is even and unbroken. Scholarly hush between warmth and ash.
- **부정**: [NEG_CORE], legible text on pages, writing on frosted glass, people
- **비율**: 16:9

### C08. 뒷방 (방 배경)
- **프롬프트**: [STYLE_CORE] A humble back room at dawn, honest eye-level frontal shot. Bare wooden walls with no sugar coating at all — the only room in the house without a single sparkle. Blue-grey dawn light through a small window overlooking a bird feeder, one candle burning. A plain wooden bed, a keepsake box, a sugar brush and bucket by the door, an old coat on a nail. Achromatic wood and bleached cream (#D8D2C2), matte textures only. Plainness that feels like grief kept tidy.
- **부정**: [NEG_CORE], sugar coating, glitter, sparkle, decoration, candy, people
- **비율**: 16:9

### C09. 응접실 — 그날 밤 (Ch9 변형)
- **프롬프트**: [STYLE_CORE] The same cottage parlor 65 years ago, drained of color under a moonlit blue tint (#7FA3BF over desaturated tones, deep shadow #1C2530). The sugar coating is gone: raw timber walls bear nine deep axe gashes and soot sprayed up to door height on the south wall. Before the wall stand faintly glowing pale-ice silhouettes (#CBD8E0) of villagers, faceless, rendered only as posture — shoulders set, tools lowered. Snow crystals drift through the room. Single moonlight source, no fire in the hearth.
- **부정**: [NEG_CORE, 단 이 컷은 axe marks·soot 허용], facial features, blood, weapons raised, warm colors, sugar sparkle
- **비율**: 16:9

### C10. 아이들의 방 — 그날 밤 (Ch9 변형)
- **프롬프트**: [STYLE_CORE] The children's room 65 years ago in moonlit blue monochrome (#7FA3BF tint, saturation stripped, shadows #1C2530). The composition looks outward from just behind the wooden crib's slats in the foreground — the viewpoint of someone small hiding inside — toward the door left ajar, cold light leaking through the gap. No figure is shown inside the cage; only the direction of a gaze implied by the framing. A faint pale-ice glow (#CBD8E0) traces the slats' inner edge where small hands would have held them. Snow crystals drift past the window.
- **부정**: [NEG_CORE], visible child, eyes, face, warm light, toys in color
- **비율**: 16:9

### C11. 우물 지하 — 그날 밤 (Ch9 변형)
- **프롬프트**: [STYLE_CORE] The underground chamber 65 years ago: the brick bread kiln stands whole and intact, its door open, faint 2200K ember warmth breathing from within — the only warm light allowed in the night mode, everything else sunk in moonlit blue (#7FA3BF, #1C2530). At the kiln door, a single small pale-ice silhouette of a child's hand (#CBD8E0) rests on the latch, and behind it larger silhouetted hands guide it, faceless. The composition keeps all figures as glowing outlines only, dignity over horror. Ash motes float instead of snow.
- **부정**: [NEG_CORE], faces, screaming figures, flames engulfing, gore, warm light beyond the kiln mouth
- **비율**: 16:9

### C12. 타이틀 「설탕은 녹는다」
- **프롬프트**: [STYLE_CORE] A gingerbread cottage in a snowy twilight forest, seen from the path below, a white bird flying ahead as if leading the viewer. Warm honey light in the windows (#E8B04B) against deep winter blue woods, sugar-frost roof glittering, candy canes at the window frames. On the lower third, one drop of melted sugar runs down the cottage wall like a slow tear, leaving a thin dark streak of exposed timber beneath the white coating. Inviting at first glance, quietly wrong at the second. Generous negative space at top for the logo.
- **부정**: [NEG_CORE], visible axe marks, ruins, night horror mood, people
- **비율**: 16:9

### C13. 엔딩 1 「재의 기록」
- **프롬프트**: [STYLE_CORE] Epilogue scene: the parlor stripped of all sugar, bare ash-grey timber walls (#4B4A46, #D8D2C2) honest in cold daylight — and through the open door, a garden flowerbed where an old man sprinkles white sugar over the soil like seed, white birds descending to it (#9FCFBE, #E8B04B glints). Indoors is monochrome record; outdoors is the only place that still sparkles. Composition splits the frame at the doorway: grey truth inside, living white outside. Quiet, unsentimental redemption.
- **부정**: [NEG_CORE], facial close-up, tears, dramatic sky, crowds
- **비율**: 16:9

### C14. 엔딩 2 「설탕의 맹세」
- **프롬프트**: [STYLE_CORE] Overhead close shot of an open guestbook on a caramel wood desk by firelight (#F6E7C9, #E8B04B), 65 years of ink signatures rendered as illegible elegant strokes, a fresh signature at the bottom still wet. From the top edge of the frame, a translucent layer of white sugar frost is creeping down over the page, crystallizing over the older names, beautiful and absolute. The fire's warm glow makes the frost sparkle like celebration. Sweetness as burial.
- **부정**: [NEG_CORE], legible words or names, readable letters, hands, faces
- **비율**: 16:9

### C15. 엔딩 3 「한 사람의 진실」
- **프롬프트**: [STYLE_CORE] Epilogue in early spring: the underground chamber's excavated ash layer, and from the grey stratum (#4B4A46) a single green sprout rising into a shaft of soft daylight from above. Beside it, two handfuls of seeds laid side by side on the ash, and two pairs of worn shoes — one man's, one woman's — standing together at the frame's edge, their owners cropped out. The only colors are the sprout's green and a warm honey light (#E8B04B) pooling around it. Small, private, complete.
- **부정**: [NEG_CORE], faces, full figures, flowers in bloom, bright cheerful palette
- **비율**: 16:9

## 5. 스포일러 검수 결과

| # | 체크 항목 | 관련 컷 | 결과 |
|---|---|---|---|
| 1 | 응접실 남벽 도끼 자국·그을음 노출 금지 (S26 전까지 설탕에 덮임) | C01 | **통과** — "smooth and unbroken" 명시 + 부정 프롬프트에 cracks/axe marks/scorch marks |
| 2 | 부엌 바닥 틈 그을음(F02) 초반 식별 금지 | C02 | **통과** — 프롬프트에서 그을음 제외 + 부정에 soot stains on floor. 그을음은 그날 밤 모드(§3-2)에서만 |
| 3 | 아이들의 방 안쪽 걸쇠 구조(F07) 노출 금지 | C05 | **통과** — "latch is hidden in shadow" + 부정에 visible latch mechanism |
| 4 | 온실 화단 아래 조약돌 주머니·골무(F06) 노출 금지 | C04 | **통과** — 부정에 buried pouch, digging marks |
| 5 | 다락 성에 글씨(T1/S21) 노출 금지 | C07 | **통과** — "frost is even and unbroken" + 부정에 writing on frosted glass |
| 6 | 정원사(헨젤)·할미(그레텔) 정체 암시 금지 — 배경 컷 인물 배제 | C01~C08 | **통과** — 전 배경 컷 빈 방 원칙, 부정에 people |
| 7 | 우물 지하 설탕 65겹 층위는 Ch7 개방 방이므로 노출 허용 | C06 | **통과** — 해당 방 자체가 Ch7 컨텐츠 |
| 8 | 타이틀의 "녹은 설탕 한 줄기" — 자국 노출이 아니라 분위기 복선 수준인지 | C12 | **통과** — 목재 노출은 가는 줄 하나, 도끼 자국·그을음 부정 처리 |
| 9 | 엔딩 2 방명록 서명 — 실제 텍스트 렌더 금지(no text 원칙 + 플레이어 서명은 UI 오버레이) | C14 | **통과** — illegible strokes 명시, 부정에 legible words |
| 10 | 그날 밤 컷의 잔혹 묘사 — §1-1 "직접적 공포 금지" 원칙 | C09~C11 | **통과** — 실루엣·무표정·발광 잔상만, gore/faces 부정 처리 |

**종합: 10항목 전부 통과, 수정 0건.** 단 구현 시 주의 1건 — C02를 그날 밤 모드 없이 Ch7 이후에도 재사용할 경우, S06(치수 모순) 클리어 후에는 바닥 틈 그을음을 CSS 오버레이로 점진 노출하는 편이 서사와 맞음(이미지 원본은 무흔 유지).

## 6. BGM 가이드 (6트랙)

**공통 규칙**: 전 트랙 어쿠스틱 위주(§1 "전기·플라스틱 금지"의 음악 버전 — 신스는 패드 최소량만). 오르골 모티프(3음, 뼈 피리 음계와 동일: 라–도–미)를 전 트랙에 변형 삽입해 통일감 확보. 루프는 심리스(첫/끝 마디 동일 코드).

### B1. 타이틀 「설탕의 집」
- **분위기**: 따뜻한 자장가 — 단, 마지막 소절만 미묘하게 단조로 기움.
- **BPM / 조성**: 72 / A장조 (끝 2마디만 F#단조 차용).
- **악기**: 오르골(뮤직박스), 첼레스타, 현악 피치카토, 낮은 첼로 지속음.
- **루프**: 60초.
- **생성 프롬프트**: `gentle music box lullaby, celesta and soft pizzicato strings, warm fairytale storybook mood, 72 bpm, A major shifting subtly minor in the final bars, a single low cello drone underneath like something waiting, no drums, seamless loop, vintage warm recording`

### B2. 탐색 전반 (Ch1~4) 「계피와 크림」
- **분위기**: 아늑한 호기심. 배경에 머무는 벽난로 같은 음악.
- **BPM / 조성**: 84 / F장조.
- **악기**: 어쿠스틱 기타 아르페지오, 우드 플루트, 글로켄슈필, 소프트 스트링 패드.
- **루프**: 90초.
- **생성 프롬프트**: `cozy curious exploration music, fingerpicked acoustic guitar arpeggios, wooden flute and glockenspiel accents, soft string pad, 84 bpm F major, crackling-hearth warmth, lightly whimsical but calm, unobtrusive background loop for puzzle solving, no percussion, seamless loop`

### B3. 탐색 후반 (Ch5~7) 「숫자가 맞지 않는다」
- **분위기**: 같은 아늑함의 골격 — 그러나 화음이 조금씩 비어 있고 차갑다. B2의 변주임을 알아챌 수 있게.
- **BPM / 조성**: 76 / F장조↔D단조 왕복.
- **악기**: B2와 동일 편성에서 글로켄슈필 제거, 첼로·비올라 추가, 오르골 모티프가 반음 어긋나게 1회 등장.
- **루프**: 90초.
- **생성 프롬프트**: `uneasy variation of a cozy exploration theme, sparse acoustic guitar with hollow open voicings, cello and viola undercurrent drifting between F major and D minor, 76 bpm, a music box motif that lands one semitone off once per loop, cold air seeping into warmth, subtle tension, no drums, seamless loop`

### B4. 긴장 고조 (S26 벽 긁기·S28 안내판 교체 등 리빌 직전 구간) 「재의 층」
- **분위기**: 폭발하지 않는 긴장. 낮게 누르는 무게 — 호러 스팅 금지.
- **BPM / 조성**: 60 / D단조.
- **악기**: 저역 첼로·콘트라베이스 지속음, 프리페어드 피아노 단타, 마른 프레임드럼 심박(극소량), 하이 스트링 하모닉스.
- **루프**: 75초.
- **생성 프롬프트**: `slow-burning suspense underscore, low cello and double bass drones in D minor, sparse prepared piano single notes like dripping, faint frame drum heartbeat at 60 bpm, high string harmonics like cold wind through glass, restrained and heavy, never exploding, no horror stingers, seamless loop`

### B5. Ch9 리빌 「그날 밤」
- **분위기**: 슬픔이 공포를 이기는 음악. 달빛 청색의 청각 버전. 그날 밤 모드 전 구간 배경.
- **BPM / 조성**: 52 / A단조 (오르골 모티프의 단조 완전판).
- **악기**: 솔로 첼로, 여성 허밍(가사 없음, 멀리), 오르골(느리게, 태엽 풀리듯), 눈 내리는 듯한 첼레스타 고음 산점.
- **루프**: 120초.
- **생성 프롬프트**: `heartbreaking revelation theme, solo cello lament in A minor at 52 bpm, distant wordless female humming, a music box playing the main lullaby motif slowly as if winding down, scattered high celesta notes falling like snow, grief overpowering fear, moonlit and hushed, cinematic but intimate, no drums, seamless loop`

### B6. 엔딩 「이야기가 시작되었다」
- **분위기**: 3분기 공용 — 애도를 통과한 뒤의 고요한 해방. 오르골 모티프가 처음으로 어긋남 없이 장조로 완주된다.
- **BPM / 조성**: 66 / A단조 → A장조 전조.
- **악기**: 피아노 주선율, 첼로·비올라, 오르골(정상 속도), 마지막 8마디에만 새소리 질감의 우드 플루트.
- **루프**: 비루프 원샷 150초 (크레딧용 페이드아웃 포함).
- **생성 프롬프트**: `quiet cathartic ending theme, tender piano melody joined by cello and viola, 66 bpm moving from A minor into A major, the music box lullaby motif finally played whole and in tune, a wooden flute like birdsong entering only near the end, mourning resolving into gentle release, warm intimate finale, non-looping piece with a soft fade ending`

**엔딩별 믹스 변형(동일 트랙 스템 조절)**: E1 재의 기록 = 피아노·현악 전면, 오르골 -6dB(공적 기록의 담담함) / E2 설탕의 맹세 = A장조 전조 구간을 페이드로 잘라 A단조에서 종료(위안의 뒷맛) / E3 한 사람의 진실 = 우드 플루트·새소리 스템 +3dB, 마지막에 뼈 피리 3음 솔로 추가.
## 7. SFX 목록

세계관 규칙: 전자음 금지 — 모든 효과음은 "이 집 안에 있는 물건"의 소리로 만든다. WebAudio 합성만으로 구현 가능하게 설계(외부 샘플 불필요).

| SFX | 소리 묘사 | WebAudio 합성 지침 (1줄) |
|---|---|---|
| 정답 | 설탕 결정이 맑게 울리는 "칭—" + 오르골 3음(라–도–미) 상행 | sine 오실레이터 880→1046→1318Hz 3음 순차(각 90ms, decay 0.4s) + highpass 노이즈 버스트 10ms |
| 오답 | 마른 나무가 낮게 "둔—" 하고 눌리는 소리. 벌점 느낌 없이 부드럽게 | triangle 110Hz 단음 200ms, lowpass 400Hz, exponential decay 0.3s — 부저(square) 금지 |
| 아이템 획득 | 천 주머니에 유리구슬 떨어지는 "톡, 또르르" | noise burst(bandpass 2kHz, 30ms) 1회 + sine 1568Hz 튐 2회(간격 80ms, 피치 -10%씩) |
| 방 이동 | 오래된 문 경첩 "끼익" 절제 + 바람 한 줌 | sawtooth 180→140Hz 글라이드 250ms(gain 0.15, lowpass 900Hz) + pink noise 스윕 0.5s 페이드 |
| 크로스룸 트리거 발동 | 멀리 다른 방에서 무언가 응답하는 "웅…" + 방울 한 점 | sine 220Hz 0.8s + Convolver(합성 노이즈 테일 1.5s IR)로 원거리 잔향, 끝에 sine 1760Hz 60ms |
| 리빌 스팅어 (Ch9 편지) | 오르골 태엽이 풀리며 음이 늘어져 멈추고, 심장 한 박, 정적 | 오르골 3음을 playbackRate 1.0→0.6 램프로 재생 후 정지, 600ms 무음, sine 55Hz 150ms(gain 0.3) — 직후 B5 페이드인 |

**볼륨 가이드**: 정답/획득 -12dB, 오답/이동 -16dB, 크로스룸 -10dB(주목 유도), 리빌 스팅어 -6dB(게임 전체에서 단 한 번뿐인 가장 큰 소리).

## 8. 폴백 — CSS/SVG 인라인 아트 지침

이미지 로드 실패·저사양 환경용. 방마다 "그라디언트 배경 + SVG 실루엣 1~2개 + 파티클 1종"의 3층 구조를 유지하면 이미지 없이도 방 식별이 가능하다. 그날 밤 모드 폴백은 전 방 공통: 기존 폴백 위에 `rgba(127,163,191,0.7)` 오버레이 + `filter: saturate(0.4)` + 파티클을 눈 결정으로 교체.

- **응접실**: `linear-gradient(160deg, #F6E7C9, #C9803D)` + 하단 중앙 벽난로 아치 SVG(`#8A5A2B`) 안에 `#E8B04B` radial-gradient 불빛 펄스(3s). 파티클: 벽난로 위로 떠오르는 금색 점 불티.
- **과자 부엌**: `linear-gradient(180deg, #8A5A2B, #A84A2A 85%)` + 중앙 오븐 사각+아치문 실루엣(`#232220`), 아치 하단에 `#E8B04B` 발광선. 파티클: 밀가루 같은 흰 점 부유.
- **식료품 저장고**: `linear-gradient(200deg, #D8D2C2, #8A5A2B)` + 좌우 선반 수평선 3단과 항아리 타원 실루엣 반복(`#4B4A46`). 파티클: 사선광 띠(회전된 흰 gradient bar, opacity 0.15) 속 먼지 점.
- **설탕 온실**: `linear-gradient(170deg, #9FCFBE 0%, #F6E7C9 60%)` + 유리 격자 SVG 라인(`rgba(255,255,255,0.4)`)과 장미 원형 클러스터(`#F6E7C9` stroke `#9FCFBE`). 파티클: 프리즘 반짝임(2px 흰 점, twinkle 애니메이션).
- **아이들의 방**: `linear-gradient(150deg, #F6E7C9 40%, #5B6B78 140%)` + 우측에 세로 슬랫 우리 실루엣(`#8A5A2B` 수직 바 6개), 좌측 문틀 눈금 짧은 가로선들. 파티클: 없음(정적인 방 — 유일하게 멈춰 있는 폴백).
- **우물 지하**: `linear-gradient(180deg, #232220, #4B4A46 70%)` + 좌상단에서 꽂히는 사선 광선 폴리곤(`#5B6B78`, opacity 0.35) + 우물 원통·가마 무너진 계단형 실루엣(`#1C2530` 계열). 파티클: 재 먼지(회색 점, 느린 하강).
- **다락 서고**: `linear-gradient(165deg, #D8D2C2, #8A5A2B 120%)` + 상단 경사 지붕 보 대각선 2개와 책등 세로 바 랜덤 폭 반복(`#8A5A2B`/`#A84A2A`/`#E8B04B`). 파티클: 채광창 사선광 속 종이 먼지.
- **뒷방**: `linear-gradient(180deg, #5B6B78, #D8D2C2 90%)` + 침대 낮은 사각 실루엣과 창 사각(`#7FA3BF` 은은한 발광) 하나. 파티클: 없음 — 대신 창 발광만 8s 주기로 아주 느리게 명멸(새벽빛).

