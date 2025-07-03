package pentacode.backend.code.admin.mapper;

import org.mapstruct.Mapper;
import pentacode.backend.code.admin.dto.AdminDTO;
import pentacode.backend.code.admin.entity.Admin;
import pentacode.backend.code.common.mapper.base.BaseMapper;

@Mapper(componentModel = "spring")
public interface AdminMapper extends BaseMapper<Admin, AdminDTO> {
}