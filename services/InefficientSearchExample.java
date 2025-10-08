import java.util.List;
import java.util.ArrayList;

public class InefficientSearchExample {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < 100000; i++) {
            list.add("Item" + i);
        }

        // ❌ recherche séquentielle inefficace
        if (list.contains("Item99999")) {
            System.out.println("Found!");
        }
    }
}
