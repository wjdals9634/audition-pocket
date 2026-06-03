package com.auditionpocket.server.common.code;

import com.auditionpocket.server.common.code.dto.CommonCodeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common-codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping
    public List<CommonCodeResponse> getCommonCodes(
            @RequestParam String groupCode
    ) {
        return commonCodeService.getActiveCodesByGroupCode(groupCode);
    }
}