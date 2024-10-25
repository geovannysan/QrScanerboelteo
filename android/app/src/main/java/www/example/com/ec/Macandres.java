package www.example.com.ec;
import static android.content.ContentValues.TAG;
import static android.content.Context.WIFI_SERVICE;

import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.Manifest;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;

import android.provider.Settings;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

@CapacitorPlugin(name="Macandres",
        permissions = {
                @Permission(
                        alias = "MAC",
                        strings = {
                                Manifest.permission.ACCESS_WIFI_STATE,
                                Manifest.permission.INTERNET,
                                Manifest.permission.ACCESS_NETWORK_STATE
                        }
                )
        }
)
public class Macandres extends Plugin {

    @PluginMethod
    public void NativeMethod(PluginCall call){
        JSObject result = new JSObject();
         String Mac = getDeviceId();
        String mac2= getLocalIp();
        String ssid = getIpAccess(this.getContext());
        Log.d("ssid",""+ssid);
        result.put("IFO red", mac2+" UUID:"+Mac);
        call.resolve(result);
    }
    @PluginMethod
    public void NativeListeners(PluginCall call){
        JSObject result = new JSObject();
        result.put("IFO red", "MAC");
        notifyListeners("EVENT_LISTENER_NAME",result);
    }

    private String getIpAccess(Context context) {
        WifiManager wifiManager = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            wifiManager = (WifiManager) context.getSystemService(WIFI_SERVICE);
        }
        int ipAddress = wifiManager.getConnectionInfo().getIpAddress();
        final String formatedIpAddress = String.format("%d.%d.%d.%d", (ipAddress & 0xff), (ipAddress >> 8 & 0xff), (ipAddress >> 16 & 0xff), (ipAddress >> 24 & 0xff));
        return formatedIpAddress; //192.168.31.2
    }
    public String getEthMac() {
        String macAddress = "Not able to read the MAC address";
        BufferedReader br = null;
        try {
            br = new BufferedReader(new FileReader("/sys/class/net/eth0/address"));
            macAddress = br.readLine().toUpperCase();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return macAddress;
    }

    public static String getDeviceId()
    {
        String serial = null;

        String m_szDevIDShort = "35" +
                Build.BOARD.length() % 10 + Build.BRAND.length() % 10 +
                Build.CPU_ABI.length() % 10 + Build.DEVICE.length() % 10 +
                Build.DISPLAY.length() % 10 + Build.HOST.length() % 10 +
                Build.ID.length() % 10 + Build.MANUFACTURER.length() % 10 +
                Build.MODEL.length() % 10 + Build.PRODUCT.length() % 10 +
                Build.TAGS.length() % 10 + Build.TYPE.length() % 10 +
                Build.USER.length() % 10; //13 bits

        try
        {

            //API>=9 use serial number

            return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();
        }
        catch (Exception exception)
        {
            //serial needs an initialization
            serial = "serial"; // Any initialization
        }

        //15-digit number pieced together using hardware information
        return new UUID(m_szDevIDShort.hashCode(), serial.hashCode()).toString();
    }
    @SuppressLint("HardwareIds")
    public static String getWifiMAC(Context context) {
        String mac = null;
        WifiManager wifiManager = (WifiManager) context.getSystemService(WIFI_SERVICE);
        if (wifiManager == null) {
        }
        try {
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            mac = wifiInfo.getMacAddress();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mac;
    }
    public static String getMacAddresss(Context activity)
    {
        WifiManager localWifiManager = (WifiManager)activity.getApplicationContext().getSystemService(WIFI_SERVICE);
        WifiInfo localWifiInfo = localWifiManager == null ? null : localWifiManager.getConnectionInfo();
        if (localWifiInfo != null)
        {
            String str = localWifiInfo.getMacAddress();
            if ((str == null) || (str.equals(""))) {
                str = "null";
            }
            return str;
        }
        return "null";
    }
    @SuppressLint("MissingPermission")
    public static int getWifiRssi(Context context) {
        try {
            WifiManager mWifiManager = (WifiManager) context.getApplicationContext().getSystemService(WIFI_SERVICE);
            if (mWifiManager != null) {
                WifiInfo mWifiInfo = mWifiManager.getConnectionInfo();
                return mWifiInfo.getRssi();
            }
        } catch (Exception e) {
            //ignore
        }
        return 0;
    }
    private static final int PERMISSIONS_REQUEST_CODE_ACCESS_FINE_LOCATION = 1001;
    private WifiManager wifiManager;
    private String scanNetwork(Context context) {
        // Habilitar WiFi si está deshabilitado
        wifiManager = (WifiManager) context.getSystemService(WIFI_SERVICE);

        // Verificar y solicitar permisos si es necesario
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
           // ActivityCompat.requestPermissions(this.getContext(), new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSIONS_REQUEST_CODE_ACCESS_FINE_LOCATION);
        }
        if (!wifiManager.isWifiEnabled()) {
           // Toast.makeText(this, "Habilitando WiFi...", Toast.LENGTH_SHORT).show();
            wifiManager.setWifiEnabled(true);
        }

        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        int ipAddress = wifiInfo.getIpAddress();
        String subnet = getSubnetAddress(ipAddress);

        new ScanTask(subnet).execute();
        return subnet;
    }

    private String getSubnetAddress(int ipAddress) {
        return String.format("%d.%d.%d.", (ipAddress & 0xff), (ipAddress >> 8 & 0xff), (ipAddress >> 16 & 0xff));
    }

    private class ScanTask extends AsyncTask<Void, String, Void> {
        private String subnet;

        public ScanTask(String subnet) {
            this.subnet = subnet;
        }

        @Override
        protected Void doInBackground(Void... voids) {
            for (int i = 1; i < 255; i++) {
                String host = subnet + i;
                try {
                    InetAddress address = InetAddress.getByName(host);
                    if (address.isReachable(1000)) {
                        // 1 segundo de timeout
                        String hostname = address.getHostName();
                        Log.d("host","hostnam"+hostname);
                        publishProgress(host,hostname);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return null;
        }

        @Override
        protected void onProgressUpdate(String... values) {
            super.onProgressUpdate(values);
            Log.d("ScanTask", "Host reachable: " + values[0]);
            //Toast.makeText(MainActivity.this, "Host reachable: " + values[0], Toast.LENGTH_SHORT).show();
        }
    }

    public static String getLocalIp() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual() || iface.isPointToPoint())
                    continue;
                if (iface.getName().startsWith("vboxnet"))
                    continue;
                Log.e(TAG, "Returning ssid : " + iface);
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    Log.e(TAG, "Returning ssid : " + addr);
                    final String ip = addr.getHostAddress();
                    if (Inet4Address.class == addr.getClass())
                        return ip;
                }
            }
        } catch (SocketException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public static String getMacAddr() {
        try {
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : all) {
                if (!nif.getName().equalsIgnoreCase("wlan0")) continue;
                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    return "";
                }
                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    res1.append(String.format("%02X:", b));
                }
                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                return res1.toString();
            }
        } catch (Exception ex) {
        }
        return "02:00:00:00:00:00";
    }
    



    // IMEI (International Mobile Equipment Identity)
    public static String getIMEI(Context context){
        return generateIMEI(context);
    }

    private static boolean isPermissionGranted(Context context) {
        String wantPermission = Manifest.permission.READ_PHONE_STATE;
        return ActivityCompat.checkSelfPermission(context, wantPermission) == PackageManager.PERMISSION_GRANTED;
    }

    private static boolean isICCIDGranted() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1;
    }

    private static String generateIMEI(Context context) {
        String uniquePseudoID = "" +
                Build.BOARD.length() % 10 +
                Build.BRAND.length() % 10 +
                Build.DEVICE.length() % 10 +
                Build.DISPLAY.length() % 10 +
                Build.HOST.length() % 10 +
                Build.ID.length() % 10 +
                Build.MANUFACTURER.length() % 10 +
                Build.MODEL.length() % 10 +
                Build.PRODUCT.length() % 10 +
                Build.TAGS.length() % 10 +
                Build.TYPE.length() % 10 +
                Build.USER.length() % 10;
        return new UUID(uniquePseudoID.hashCode(), getAndroidId(context).hashCode()).toString();
    }

    private static String getAndroidId(Context context) {
        String id = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
        return id == null ? "" : id;
    }
/*
        public static String getMacAddress(Context context) {
            WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            WifiInfo wInfo = wifiManager.getConnectionInfo();
            String macAddress = wInfo.getMacAddress();
            //WifiManager wifiManager = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);

            if (macAddress != null) {

                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                Log.e(TAG,"MAC Address : " + wifiInfo);
                return wifiInfo.getMacAddress();
            } else {
                return null;
            }
        }
*/

}


