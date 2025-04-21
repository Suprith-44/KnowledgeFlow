package service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;

import java.io.FileInputStream;
import java.io.IOException;

public class FirebaseService {
    private static FirebaseService instance;
    
    private FirebaseService() {}
    
    public static FirebaseService getInstance() {
        if (instance == null) {
            instance = new FirebaseService();
        }
        return instance;
    }
    
    public void initializeFirebase() throws IOException {
        FileInputStream serviceAccount = new FileInputStream("D:/Sem-6/OOAD/Final Project/Backend/Firebase.json");

        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .setDatabaseUrl("https://ooad-470e4-default-rtdb.asia-southeast1.firebasedatabase.app")
            .build();
            
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}