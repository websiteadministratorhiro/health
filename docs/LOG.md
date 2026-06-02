# apl/health 作業ログ

## 2026-06-02 初期実装・デプロイ完了

### 実装内容
- Next.js 16 + TypeScript + Tailwind v4 + Supabase + PWA
- 画面：ダッシュボード・日次詳細・データ入力・トレンド・プロフィール
- Supabase：kakeiboプロジェクト（jdnstdbfyxowjpkimbkk）に相乗り、`hl_`プレフィックス
- テーブル：hl_profile / hl_daily_records / hl_meals / hl_workouts
- Claude報告フロー：JSON貼り付けで一括登録
- 計算：BMI・BMR・TDEE・PFC・目標カロリー（目標タイプ別）
- アイコン：緑背景＋白心拍線＋葉っぱ（PNG 192/512）

### 決定事項
- ログイン機能なし
- Supabase RLS有効・全操作許可ポリシー（個人利用のため）
- 目標タイプ：ダイエット / 筋トレ / 維持（PFC比率が変わる）
- kanji-battle・kondateは廃止→DBテーブル削除予定（未実施）

### デプロイ情報
- GitHub: https://github.com/websiteadministratorhiro/health
- Vercel: https://health-pied-zeta.vercel.app

### 次回やること
- [ ] 動作確認（プロフィール設定→データ入力→ダッシュボード表示）
- [ ] kanji-battle・kondateのDBテーブル削除（Supabase kakeibo枠）
- [ ] wikiのアプリ開発ページ更新（health追加・kondate/kanji-battle廃止反映）
