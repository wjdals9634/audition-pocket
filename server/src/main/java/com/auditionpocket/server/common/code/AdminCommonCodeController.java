package com.auditionpocket.server.common.code;

import com.auditionpocket.server.common.code.dto.CommonCodeCreateRequest;
import com.auditionpocket.server.common.code.dto.CommonCodeResponse;
import com.auditionpocket.server.common.code.dto.CommonCodeUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/common-codes")
@RequiredArgsConstructor
public class AdminCommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping
    public List<CommonCodeResponse> getCommonCodes() {
        return commonCodeService.getAllCodesForAdmin();
    }

    @GetMapping("/{id}")
    public CommonCodeResponse getCommonCode(
            @PathVariable String id
    ) {
        return commonCodeService.getCodeForAdmin(id);
    }

    @PostMapping
    public CommonCodeResponse createCommonCode(
            @Valid @RequestBody CommonCodeCreateRequest request
    ) {
        return commonCodeService.createCode(request);
    }

    @PatchMapping("/{id}")
    public CommonCodeResponse updateCommonCode(
            @PathVariable String id,
            @RequestBody CommonCodeUpdateRequest request
    ) {
        return commonCodeService.updateCode(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCommonCode(
            @PathVariable String id
    ) {
        commonCodeService.deleteCode(id);
    }
}