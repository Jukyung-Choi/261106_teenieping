const demoLanguages = ['ko', 'en', 'ja', 'zh-CN'];
const demoLanguageKey = 'teenieping-demo-language';
let demoLanguage = 'ko';
try {
  const saved = localStorage.getItem(demoLanguageKey);
  if (demoLanguages.includes(saved)) demoLanguage = saved;
} catch { /* Language selection also works without storage. */ }

const demoTranslations = new Map(`
티니핑 세상|Teenieping World|ティニピンワールド|提尼平世界
티니핑 세상 미니게임|Teenieping World mini-game|ティニピンワールド ミニゲーム|提尼平世界小游戏
상태 표시줄|Status bar|ステータスバー|状态栏
뒤로 가기|Go back|戻る|返回
연결이 끊겼어요|Connection lost|接続が切れました|连接已断开
연결 안내 닫기|Close connection notice|接続案内を閉じる|关闭连接提示
인터넷 연결을 확인 한 후<br>다시 시도해 주세요.|Check your internet connection<br>and try again.|インターネット接続を確認して<br>もう一度お試しください。|请检查网络连接后<br>重试。
다시 연결|Reconnect|再接続|重新连接
다시 시도|Try again|再試行|重试
연결 확인 중…|Checking connection…|接続を確認中…|正在检查连接…
아직 연결할 수 없어요. 잠시 후 다시 시도해 주세요.|Still unable to connect. Please try again shortly.|まだ接続できません。しばらくしてからお試しください。|暂时无法连接，请稍后重试。
다시 연결됐어요|Connected again|再接続しました|已重新连接

나의 소울 게이지|My Soul Gauge|マイソウルゲージ|我的灵魂能量
나의 소울게이지|My Soul Gauge|マイソウルゲージ|我的灵魂能量
받을 수 있는 소울 보상 확인하기|View available Soul rewards|受け取れるソウル報酬を見る|查看可领取的灵魂奖励
🎁 보상을 받을 수 있어요!|🎁 Rewards ready!|🎁 報酬を受け取れます！|🎁 奖励可领取！
참여방법|How to Play|遊び方|参与方法
개발용 데모 패널 열기|Open demo settings|デモ設定を開く|打开演示设置
꾸미기 메뉴|Customization menu|カスタマイズメニュー|装扮菜单
게임 메뉴|Game menu|ゲームメニュー|游戏菜单
숏컷 배경 바꾸기|Change<br>Background|背景変更|更换背景
숏컷 티니핑 부스|Teenieping<br>Booth|ティニピン<br>ブース|提尼平<br>拍照亭
메인 메뉴 도감|collection|ずかん|图鉴
메인 메뉴 뽑기|gacha|ガチャ|抽取
배경 바꾸기|Change Background|背景変更|更换背景
티니핑 부스|Teenieping Booth|ティニピンブース|提尼平拍照亭
랭킹|Ranking|ランキング|排行榜
도감|Collection|ずかん|图鉴
뽑기|Draw|ガチャ|抽取
한번에 충전하기|Charge All|まとめてチャージ|一键充能
한번에<br>충전하기|charge<br>All|まとめて<br>チャージ|一键<br>充能
닫기|Close|閉じる|关闭
팝업 닫기|Close pop-up|ポップアップを閉じる|关闭弹窗
안내|Information|ご案内|提示
확인|OK|確認|确定
받기|Get|受け取る|领取
완료|Done|受取済み|已领取
미달성|Locked|未達成|未达成
보상 확인 후 단계별 보상으로 돌아가기|Confirm and return to Soul rewards|報酬を確認して段階報酬に戻る|确认后返回阶段奖励
보상 확인 후 데모 패널로 돌아가기|Confirm and return to demo settings|報酬を確認してデモ設定に戻る|确认后返回演示设置
DEVELOPER TOOLS|DEVELOPER TOOLS|開発者ツール|开发者工具
DEMO|DEMO|デモ|演示
데모 패널|Demo Settings|デモ設定|演示设置
데모 패널 닫기|Close demo settings|デモ設定を閉じる|关闭演示设置
화면 언어|Display Language|表示言語|显示语言
전체 게이지|Overall Gauge|全体ゲージ|总能量
보유 티니핑|Owned Teeniepings|所持ティニピン|已拥有的提尼平
패널을 연 동안 XP 자동 감소가 일시정지됩니다.|XP decay pauses while this panel is open.|パネルを開いている間はXPの自動減少が一時停止します。|此面板打开时，XP 自动衰减会暂停。
소울 보상 수령 미리보기|Preview Soul Reward Claim|ソウル報酬の受取プレビュー|预览领取灵魂奖励
받기 버튼 강제 활성화|Enable All Claim Buttons|受取ボタンを常に有効にする|强制启用领取按钮
꺼짐|Off|オフ|关闭
켜짐|On|オン|开启
켜면 미달성 보상도 ‘받기’로 표시돼요.|Show Claim even for rewards you haven’t unlocked.|オンにすると未達成の報酬も「受け取る」と表示されます。|开启后，未达成的奖励也会显示「领取」。
단계별 보상 상태|Reward Stage Status|段階報酬の状態|阶段奖励状态
보상 단계|Reward Stage|報酬段階|奖励阶段
표시 상태|Status|表示状態|显示状态
기본 상태|Default|デフォルト|默认状态
보상수령 1|Reward Claim 1|報酬受取1|领取奖励 1
누를 때마다 별빛을 다시 볼 수 있어요.|Tap to replay the star effect.|タップするたびに星の演出を再生できます。|每次点击都可重播星光效果。
게이지양|Gauge Level|ゲージ量|能量值
게이지 직접 입력|Enter a gauge level|ゲージ量を直接入力|直接输入能量值
게이지 빠른 설정|Gauge presets|ゲージ量のプリセット|能量值预设
보유 티니핑의 XP 비율을 변경해요. Base XP 30% 아래로는 내려가지 않아요.|Set the XP of your Teeniepings. The minimum is 30%.|所持ティニピンのXPを調整します。最低値は30%です。|调整已拥有的提尼平的 XP，最低为 30%。
보유 티니핑 마릿수 조절|Adjust Teenieping count|所持ティニピンの数を調整|调整提尼平数量
한 마리 줄이기|Remove one|1体減らす|减少一只
한 마리 늘리기|Add one|1体増やす|增加一只
보유 마릿수 빠른 설정|Teenieping count presets|所持数のプリセット|拥有数量预设
{n}마리|{n}|{n}体|{n} 只
한 마리 늘리기를 누르면 패널이 닫히고 소환 연출을 확인할 수 있어요.|Tap Add one to close the panel and preview the summon effect.|「1体増やす」を押すとパネルが閉じ、召喚演出を確認できます。|点击「增加一只」会关闭面板并播放召唤效果。
점수·순위 표시|Show Score and Rank|スコア・順位を表示|显示积分和排名
표시|Show|表示|显示
숨김|Hide|非表示|隐藏
상단 소울게이지 아래의 랭킹점수와 순위 노출 여부를 변경합니다.|Show or hide the score and rank below the Soul Gauge.|ソウルゲージの下に表示されるスコアと順位を切り替えます。|切换灵魂能量条下方的积分和排名显示。
소울 보상 말풍선 미리보기|Preview Reward Tooltip|報酬吹き出しのプレビュー|预览奖励提示气泡
켜고 ‘적용 완료’를 누르면 보상 달성 여부와 관계없이 5초 동안 표시한 뒤 자동으로 꺼져요.|Turn on and tap Done to preview the tooltip for 5 seconds. This option then turns off automatically.|オンにして「完了」を押すと、達成状況にかかわらず5秒間表示され、自動的にオフになります。|开启并点击「完成」后，气泡将显示5秒，然后自动关闭此设置。
나의 소울 게이지 직접 입력|Enter your Soul Gauge value|ソウルゲージの値を直接入力|直接输入灵魂能量值
소울 게이지 빠른 설정|Soul Gauge presets|ソウルゲージのプリセット|灵魂能量预设
직접 입력하거나 목표 수치를 선택하세요. 티니핑별 게이지와 기존 보상 수령 기록은 유지돼요.|Enter a value or choose a preset. Individual XP and claimed rewards are kept.|値を入力するかプリセットを選択してください。個別XPと報酬の受取履歴は維持されます。|输入数值或选择预设。提尼平的 XP 和领取记录会保留。
티니핑 색상 보정|Teenieping Color Adjustment|ティニピンの色調補正|提尼平色彩调整
보정|Adjusted|補正後|调整后
원본|Original|元画像|原图
원본과 보정 색상 비교|Compare original and adjusted colors|補正前後の色を比較|对比调整前后的颜色
원본 티니핑|Original Teenieping|補正前のティニピン|原始提尼平
보정 티니핑|Adjusted Teenieping|補正後のティニピン|调整后的提尼平
비교할 티니핑|Teenieping to compare|比較するティニピン|对比对象
색상 비교 티니핑|Teenieping for color comparison|色比較用のティニピン|用于色彩对比的提尼平
채도|Saturation|彩度|饱和度
채도 직접 입력|Enter saturation|彩度を入力|输入饱和度
입력 레벨 · 검정|Input Levels · Black|入力レベル・黒|输入色阶 · 黑场
입력 검정 레벨 직접 입력|Enter black level|黒レベルを入力|输入黑场色阶
입력 검정 레벨|Black level|黒レベル|黑场色阶
입력 레벨 · 감마|Input Levels · Gamma|入力レベル・ガンマ|输入色阶 · 伽马
입력 감마 직접 입력|Enter gamma|ガンマを入力|输入伽马值
입력 감마|Gamma|ガンマ|伽马
입력 레벨 · 흰색|Input Levels · White|入力レベル・白|输入色阶 · 白场
입력 흰색 레벨 직접 입력|Enter white level|白レベルを入力|输入白场色阶
입력 흰색 레벨|White level|白レベル|白场色阶
레벨|Levels|レベル|色阶
요청값 +25|Preset +25|プリセット +25|预设 +25
보정값 초기화|Reset Colors|補正値をリセット|重置色彩
설정 파일 저장|Save Settings File|設定ファイルを保存|保存设置文件
슬라이더와 숫자로 조절하고 설정 파일을 저장하세요.|Adjust with the sliders or fields, then save the settings file.|スライダーや数値で調整し、設定ファイルを保存できます。|使用滑块或数值调整并保存设置文件。
30종의 유영·눈 감은 상태·도감에 함께 적용합니다. 원본 파일은 변경하지 않아요. 최종 파일은 저장한 설정으로 보정 후 확인해 주세요.|Applies to all 30 characters in the world, at rest, and in the Collection. Source files are kept intact.|全30体の通常・休憩・ずかん表示に適用されます。元ファイルは保持されます。|应用于全部 30 个角色的活动、休息和图鉴显示。原始文件会保留。
전체 티니핑에 실시간 보정 중입니다.|Live color adjustment is on for all Teeniepings.|全ティニピンに色調補正を適用しています。|已对所有提尼平实时应用色彩调整。
전체 화면은 원본 비교 중입니다.|Showing original colors.|元の色を表示しています。|正在显示原始颜色。
설정은 이 브라우저에 저장됩니다.|Settings are saved in this browser.|設定はこのブラウザーに保存されます。|设置会保存在此浏览器中。
브라우저 저장을 사용할 수 없어 설정 파일로 보관해 주세요.|Browser storage is unavailable. Save a settings file to keep your changes.|ブラウザーに保存できません。設定ファイルを保存してください。|浏览器存储不可用，请保存设置文件。
보정 설정 파일을 저장했어요|Color settings file saved.|補正設定ファイルを保存しました。|色彩设置文件已保存。
팝업 로딩 미리보기|Preview Pop-up Loading|ポップアップの読み込みをプレビュー|预览弹窗加载
팝업|Pop-up|ポップアップ|弹窗
소울 게이지 단계별 보상|Soul Gauge Rewards|ソウルゲージ報酬|灵魂能量阶段奖励
획득한 티니핑이 없어요!|No Teeniepings Yet!|ティニピンがまだいません！|还没有获得提尼平！
소울 보상 수령|Claim Soul Reward|ソウル報酬の受取|领取灵魂奖励
재생|Play|再生|播放
초기 상태로|Reset Demo|デモをリセット|重置演示
적용 완료|Done|完了|完成
팝업 로딩 중|Loading pop-up|ポップアップを読み込み中|正在加载弹窗
불러오는 중|Loading|読み込み中|加载中
컬렉템 뽑기|Collectem Draw|コレクテムガチャ|收藏抽取
1회 뽑기|Draw Once|1回引く|抽取 1 次
하츄핑을 획득했어요. 티니핑 세상으로 돌아가기|You got Heartsping. Return to Teenieping World.|ハチュピンを獲得しました。ティニピンワールドに戻る。|获得了爱心提尼平。返回提尼平世界。
배경 선택|Select a Background|背景を選ぶ|选择背景
분홍 구름과 별빛|Pink Clouds and Starlight|ピンクの雲と星明かり|粉色云朵与星光
파스텔 별빛 구름|Pastel Starlit Clouds|パステルの星空と雲|粉彩星光云朵
핑크 하트|Pink Hearts|ピンクのハート|粉色爱心
핑크 라벤더|Pink Lavender|ピンクラベンダー|粉紫梦境
분홍 구름과 파스텔 하늘|Pink Clouds and Pastel Sky|ピンクの雲とパステルの空|粉色云朵与粉彩天空
별과 구름의 파스텔 하늘|Pastel Sky with Stars and Clouds|星と雲のパステル空|繁星云朵的粉彩天空
500코인|500 Coins|500コイン|500 金币
1젬|1 ZEM|1 ZEM|1 ZEM
티니핑 효과|Teenieping Effect|ティニピンエフェクト|提尼平特效
헤드웨어|Headwear|ヘッドウェア|头饰
오로라 드레스|Aurora Dress|オーロラドレス|极光礼服
레인보우 슈즈|Rainbow Shoes|レインボーシューズ|彩虹鞋
로미 헤어|Romi Hairstyle|ロミのヘアスタイル|罗米发型
랭킹점수|Score|スコア|积分
점| pts|点|分
위||位|名
{n}위|Rank {n}|{n}位|第 {n} 名
나의 랭킹점수 {score}점, 현재 순위 {rank}위|My score: {score} points, rank: {rank}|マイスコア {score}点、現在の順位 {rank}位|我的积分 {score} 分，当前第 {rank} 名
{name} XP {xp}%. 터치해서 최대 15 XP 회복하기|{name}, {xp}% XP. Tap to restore up to 15 XP.|{name}のXP {xp}%。タップして最大15 XP回復。|{name}，XP {xp}%。点击最多恢复 15 XP。
이미 XP가 가득 차 있어요|XP is already full.|XPはすでに満タンです。|XP 已满。
, 받을 수 있는 보상 {n}개|, {n} rewards ready|、受け取れる報酬 {n}件|，有 {n} 个奖励可领取
데모: 소울 보상 말풍선 미리보기입니다.|Demo: Soul reward tooltip preview.|デモ：ソウル報酬の吹き出しプレビューです。|演示：灵魂奖励提示预览。
받을 수 있는 소울 보상이 {n}개 있어요. 소울 게이지를 눌러 확인해 보세요.|{n} Soul rewards are ready. Tap the Soul Gauge to see them.|ソウル報酬を{n}件受け取れます。ソウルゲージをタップして確認してください。|有 {n} 个灵魂奖励可领取。点击灵魂能量条查看。
{reward} 받았어요!|You got {reward}!|{reward}を獲得しました！|获得了{reward}！
{n} 달성시|At {n} Soul|{n}達成時|达到 {n} 时
소울게이지 단계별 보상 목록|Soul Gauge reward list|ソウルゲージ報酬一覧|灵魂能量阶段奖励列表
SNS 이벤트|Social Event|SNSイベント|社交媒体活动
티니핑 컬렉템에서 티니핑을 획득해요!|Get Teeniepings from Teenieping Collectem!|ティニピンコレクテムでティニピンをゲット！|在提尼平收藏中获得提尼平！
획득한 티니핑을 티니핑 세상에서 돌봐줘요.|Care for them in Teenieping World.|ティニピンワールドでお世話をしましょう。|在提尼平世界照顾它们。
티니핑을 잘 돌봐줄수록 점수가 더 많이<br>쌓여요!|The better you care for them, the more points you earn!|たくさんお世話すると、<br>スコアがもっと貯まります！|照顾得越好，获得的积分就越多！
쌓인 점수에 따라 랭킹이 정해져요.|Your score determines your rank.|貯まったスコアで順位が決まります。|累计积分决定排名。
100위 안에 들면 보상을 받을 수 있어요!|Finish in the top 100 to earn rewards!|100位以内に入ると報酬がもらえます！|进入前 100 名即可获得奖励！
자주 들어와서 소울 게이지를 높게 유지할수록 높은 랭킹<br>점수를 유지할 수 있어요!|Visit often and keep your Soul Gauge high to maintain a higher ranking score!|こまめに遊んでソウルゲージを高く保つと、<br>高いランキングスコアを維持できます！|经常回来并保持较高的灵魂能量，就能维持更高的排名积分！
Tip|Tip|ヒント|提示
나의 티니핑세상을 피드 또는<br>SNS에 자랑해주세요!|Share your Teenieping World<br>on your feed or social media!|自分のティニピンワールドを<br>フィードやSNSでシェアしよう！|在动态或社交平台上<br>分享你的提尼平世界吧！
이벤트 종료 후, 추첨하여<br>특별한 보상을 제공합니다!|After the event, we’ll draw winners<br>for special rewards!|イベント終了後、抽選で<br>特別な報酬をプレゼントします！|活动结束后，将抽取幸运玩家<br>并赠送特别奖励！
해시태그 필수!|is required!|をつけて投稿！|为必填话题标签！
안내 메뉴|Help tabs|案内メニュー|帮助选项
Follow|Follow|フォロー|关注
Following|Following|フォロー中|已关注
TOP|TOP|上位|前
순위별 보상|Rewards by Rank|順位別報酬|排名奖励
스페셜 드레스 세트|Special Dress Set|スペシャルドレスセット|特别礼服套装
보상안내|Rewards|報酬案内|奖励说明
랭킹 메뉴|Ranking tabs|ランキングメニュー|排行榜选项
랭킹 목록|Leaderboard|ランキング一覧|排行榜列表
나의 랭킹|My Rank|自分の順位|我的排名
나의 점수|My Score|マイスコア|我的积分
기간: 2027년 1월 1일 10:00 ~ 현재 (KST)|Period: Jan 1, 2027, 10:00 – now (KST)|期間：2027年1月1日 10:00 ～ 現在（KST）|时间：2027 年 1 月 1 日 10:00 至今（KST）
기준: 이벤트 기간 누적 랭킹점수 기준|Based on points earned during the event|基準：イベント期間中の累積スコア|依据：活动期间的累计排名积分
보유|Owned|所持|已拥有
미획득|Not owned|未獲得|未获得
{n}성|{n} stars|星{n}|{n} 星
티니핑 도감 30종|30 Teeniepings in the Collection|ティニピンずかん 全30種|提尼平图鉴（共 30 种）
레전드|Legend|レジェンド|传奇
로열|Royal|ロイヤル|皇家
일반|Normal|ノーマル|普通
오늘 무료 충전 {n}회 남음|{n} free charges left today|本日の無料チャージ 残り{n}回|今日剩余 {n} 次免费充能
오늘 무료 충전 3회를 모두 사용했어요|You’ve used all 3 free charges today.|本日の無料チャージ3回を使い切りました。|今天的 3 次免费充能已用完。
컬렉템으로 이동해서<br>첫 번째 티니핑을 획득해보세요!|Go to Collectem to get<br>your first Teenieping!|コレクテムに移動して、<br>最初のティニピンをゲットしよう！|前往收藏，<br>获得你的第一只提尼平吧！
컬렉템으로 가기|Go to Collectem|コレクテムへ|前往收藏
<strong>무료 충전</strong>은 <strong>하루에 3번</strong>까지 가능해요.<br>4번째 충전부터는 <strong>1젬</strong>이 필요해요.|Charge for free <strong>3 times a day</strong>.<br>Each extra charge costs <strong>1 ZEM</strong>.|<strong>無料チャージ</strong>は<strong>1日3回</strong>まで。<br>4回目からは<strong>1 ZEM</strong>が必要です。|每天可<strong>免费充能 3 次</strong>。<br>从第 4 次起需花费 <strong>1 ZEM</strong>。
오늘 무료 : {n}/3 사용|Free charges used: {n} / 3|本日の無料チャージ：{n} / 3 回使用済み|今日免费次数：已用 {n} / 3 次
충전 완료|Fully Charged|チャージ完了|已充满
1젬으로 충전하기|Charge for 1 ZEM|1 ZEMでチャージ|花费 1 ZEM 充能
무료로 충전하기|Charge for Free|無料でチャージ|免费充能
기본 {n}종과 XP 상태를 복원했어요|Restored the default {n} Teeniepings and their XP.|初期状態の{n}体とXPを復元しました。|已恢复默认的 {n} 只提尼平及其 XP。
컬렉템 이동 브리지가 호출됐어요|Collectem navigation requested.|コレクテムへの移動をリクエストしました。|已请求跳转到收藏。
인앱 브리지 연결 전 미리보기입니다|Preview mode. The in-app bridge is offline.|プレビュー中です。アプリ連携は未接続です。|当前为预览模式，应用桥接未连接。
보상 수령 요청을 기록했어요 (미리보기)|Reward claim recorded (preview).|報酬の受取リクエストを記録しました（プレビュー）。|已记录奖励领取请求（预览）。
뒤로 갈 화면이 없어요|There’s no previous screen.|戻る画面がありません。|没有可返回的页面。
컬렉템을 1회 뽑아볼까요?|Draw one Collectem?|コレクテムを1回引きますか？|要抽取一次收藏吗？
축하해요!|Congratulations!|おめでとう！|恭喜！
컬렉템을 획득했어요|You got a Collectem!|コレクテムを獲得しました！|你获得了一个收藏！
화면을 터치해 다음으로 넘어갈 수 있어요|Tap to continue|画面をタップして次へ|点击屏幕继续
NORMAL|NORMAL|ノーマル|普通
[코인] 월하의 늑대|[Coins] Moonlit Wolf|［コイン］月下の狼|［金币］月下之狼
[코인] 고스트 키티|[Coins] Ghost Kitty|［コイン］ゴーストキティ|［金币］幽灵猫咪
3일|3 days|3日|3 天
9일 23시간 21분 남음|9d 23h 21m left|残り9日23時間21分|还剩 9 天 23 小时 21 分
입어보기|Try on|試着する|试穿
아이템 1/27|Items 1/27|アイテム 1/27|道具 1/27
Free Mileage|Free Mileage|無料マイレージ|免费里程
하츄핑|Heartsping|ハチュピン|爱心提尼平
빛나핑|Bitnaping|ピンナピン|闪耀提尼平
차차핑|Chachaping|チャチャピン|恰恰提尼平
오로라핑|Auroraping|オーロラピン|极光提尼平
달콤핑|Dalkomping|ダルコムピン|甜甜提尼平
고마핑|Gomaping|コマピン|感恩提尼平
깡총핑|Kkangchongping|カンチョンピン|蹦跳提尼平
나그네핑|Nageuneping|ナグネピン|旅人提尼平
나눔핑|Nanumping|ナヌムピン|分享提尼平
딩동핑|Dingdongping|ディンドンピン|叮咚提尼平
또너핑|Ttoneoping|トノピン|托诺提尼平
라라핑|Lalaping|ララピン|啦啦提尼平
라임핑|Limeping|ライムピン|青柠提尼平
레몬핑|Lemonping|レモンピン|柠檬提尼平
말랑핑|Mallangping|マランピン|软软提尼平
바로핑|Baroping|バロピン|巴罗提尼平
반짝핑|Banjjakping|パンチャクピン|亮晶晶提尼平
뽀뽀핑|Ppoppoping|ポッポピン|亲亲提尼平
뽀송핑|Pposongping|ポソンピン|绒绒提尼平
뿌뿌핑|Ppupuping|ププピン|噗噗提尼平
새콤핑|Saekomping|セコムピン|酸酸提尼平
샌드핑|Sandping|サンドピン|沙沙提尼平
샤샤핑|Shashaping|シャシャピン|莎莎提尼平
아자핑|Ajaping|アジャピン|加油提尼平
왕자핑|Wangjaping|ワンジャピン|王子提尼平
요거핑|Yogurtping|ヨゴピン|酸奶提尼平
체리핑|Cherryping|チェリーピン|樱桃提尼平
초롱핑|Chorongping|チョロンピン|灯笼提尼平
포실핑|Posilping|ポシルピン|蓬蓬提尼平
해핑|Haeping|ヘピン|阳光提尼平
빛나는핑|ShinyPing|キラキラピン|闪亮提尼平
소울메이트|Soulmate|ソウルメイト|灵魂伙伴
귀염핑|CutiePing|キューティーピン|可爱提尼平
빠른핑|SpeedyPing|スピーディーピン|飞速提尼平
집사핑|CaretakerPing|お世話ピン|照顾者提尼平
별하늘|Starry Sky|星空|星空
핑크러버|Pink Lover|ピンクラバー|粉色爱好者
하츄러버|Heartsping Fan|ハチュピン推し|爱心提尼平粉丝
`.trim().split('\n').map(line => {
  const [ko, en, ja, zh] = line.split('|');
  return [ko, {en, ja, 'zh-CN': zh}];
}));

function tr(key, values = {}) {
  const pattern = demoTranslations.get(key)?.[demoLanguage] ?? key;
  return pattern.replace(/\{(\w+)\}/g, (token, name) => Object.hasOwn(values, name) ? values[name] : token);
}

const staticTranslations = [];

function prepareStaticTranslations() {
  const koreanDemoControls = '.demo-layer, .demo-toggle';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement.closest(`script,style,svg,[data-i18n-html],${koreanDemoControls}`)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parts = node.nodeValue.match(/^(\s*)(\S[\s\S]*?)(\s*)$/);
    if (!parts) continue;
    const [, before, key, after] = parts;
    if (demoTranslations.has(key)) {
      staticTranslations.push(() => { node.nodeValue = before + tr(key) + after; });
    }
  }
  for (const element of document.querySelectorAll('[aria-label],[alt],[title]')) {
    if (element.closest(koreanDemoControls)) continue;
    for (const attribute of ['aria-label','alt','title']) {
      const key = element.getAttribute(attribute);
      if (demoTranslations.has(key)) staticTranslations.push(() => element.setAttribute(attribute, tr(key)));
    }
  }
  for (const element of document.querySelectorAll('[data-i18n-html]')) {
    if (element.closest(koreanDemoControls)) continue;
    const original = element.innerHTML;
    const key = element.dataset.i18nHtml || original;
    staticTranslations.push(() => { element.innerHTML = demoLanguage === 'ko' ? original : tr(key); });
  }
}

function translateStaticUI() {
  document.documentElement.lang = demoLanguage;
  document.title = tr('티니핑 세상');
  staticTranslations.forEach(update => update());
}
