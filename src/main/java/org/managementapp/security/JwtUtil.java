package org.managementapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // FIXED secret key — ab ye application.properties (ya Render environment
    // variable) se aayega, isliye server restart/sleep hone par bhi same
    // key rahegi aur purane tokens invalid nahi honge.
    //
    // application.properties me ye line add karo:
    //   jwt.secret=YourVeryLongRandomSecretStringAtLeast32CharactersLong123456
    //
    // Render me: Environment tab me JWT_SECRET naam se ek env variable
    // add karo (32+ characters ka random string), aur application.properties
    // me likho: jwt.secret=${JWT_SECRET}
    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    private Key getKey() {
        if (key == null) {
            key = Keys.hmacShaKeyFor(secret.getBytes());
        }
        return key;
    }

    private final long EXPIRATION = 1000L * 60 * 60 * 24 * 7; // 7 days

    public String generateToken(String phone, String role) {
        return Jwts.builder()
                .setSubject(phone)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Token ke andar se email (subject) nikalta hai — login pe email hi subject set hota hai
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}