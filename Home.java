public class Home {

    public static void max(int a, int b){
        if(a>b){
            System.out.println("a is greater than b");
        } else if(a<b){
            System.out.println("b is greater than a");
        } else {
            System.out.println("a and b are equal");
        }
    };
    public static void step(String[] args) {
        System.out.println("jeevitha is a good girl and she is a software engineer annd she is working in a company called cognizant and she is doing good work in the company and ");
        
    }
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java Programming");
        max(55, 80);
        step(args);
    }
}