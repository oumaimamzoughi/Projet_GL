import java.util.ArrayList;
import java.util.List;

public class Memoryleak {
    private static List<byte[]> memoryList = new ArrayList<>();

    public static void main(String[] args) {
        for (int i = 0; i < 10000; i++) {
            // Allocation répétée sans libération
            byte[] block = new byte[1024 * 1024]; // 1 Mo
            memoryList.add(block);
            System.out.println("Iteration " + i);
        }
    }
    
}
