package www.example.com.ec;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;



public class MainActivity extends BridgeActivity {
    @Override
    public  void onCreate(Bundle savedInstanceState) {
       
        registerPlugin(Macandres.class);
        super.onCreate(savedInstanceState);

    }

}
